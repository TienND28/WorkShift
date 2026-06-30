import type { Request } from "express";
import { User, UserAuthProvider } from "../user/models/index.js";
import { AuthProvider } from "../../common/enums/authProvider.enum.js";
import { ProfileType } from "../../common/enums/profileType.enum.js";
import { UserStatus } from "../../common/enums/userStatus.enum.js";
import { ApiMessages } from "../../constants/index.js";
import {
  generateTokens,
  verifyToken,
  buildJwtPayload,
  UnauthorizedError,
  NotFoundError,
} from "../../utils/index.js";
import {
  type GoogleAuthInput,
  type RefreshTokenInput,
} from "./auth.schema.js";
import { profileService } from "../profile/profile.service.js";
import { googleAuthService } from "./google.service.js";
import { sessionService } from "./session.service.js";
import {
  assertUserCanLogin,
  formatAuthUser,
  issueAuthTokens,
  resolveProfileTypes,
  syncUserFromGoogle,
} from "./auth.helpers.js";
import { resolveOnboardingStatus } from "./onboarding.service.js";
import type { SelectProfileTypeInput } from "./auth.schema.js";
import { BadRequestError } from "../../utils/errors.js";

async function ensureUniqueUsername(base: string): Promise<string> {
  let candidate = base.slice(0, 30);
  let suffix = 0;

  while (await User.exists({ username: candidate })) {
    suffix += 1;
    const tail = String(suffix);
    candidate = `${base.slice(0, 30 - tail.length)}${tail}`;
  }

  return candidate;
}

export class AuthService {
  async loginWithGoogle(data: GoogleAuthInput, req?: Request) {
    const googleUser = await googleAuthService.verifyIdToken(data.idToken);

    const authProvider = await UserAuthProvider.findOne({
      provider: AuthProvider.GOOGLE,
      providerUserId: googleUser.sub,
    });

    let user =
      authProvider !== null
        ? await User.findById(authProvider.userId)
        : await User.findOne({ email: googleUser.email });

    if (user && !authProvider) {
      await UserAuthProvider.create({
        userId: user._id,
        provider: AuthProvider.GOOGLE,
        providerUserId: googleUser.sub,
        providerEmail: googleUser.email,
      });
    }

    if (!user) {
      const username = await ensureUniqueUsername(googleUser.username);

      user = await User.create({
        email: googleUser.email,
        username,
        fullName: googleUser.fullName,
        ...(googleUser.avatarUrl ? { avatarUrl: googleUser.avatarUrl } : {}),
        status: UserStatus.ACTIVE,
      });

      await UserAuthProvider.create({
        userId: user._id,
        provider: AuthProvider.GOOGLE,
        providerUserId: googleUser.sub,
        providerEmail: googleUser.email,
      });
    } else {
      syncUserFromGoogle(user, googleUser);
      const taken = await User.exists({
        username: googleUser.username,
        _id: { $ne: user._id },
      });
      if (!taken) {
        user.username = googleUser.username;
      }
      await user.save();
    }

    assertUserCanLogin(user);

    const profileTypes = await resolveProfileTypes(user._id.toString());
    const onboarding = await resolveOnboardingStatus(user, profileTypes);
    return issueAuthTokens(user, profileTypes, req, onboarding);
  }

  async selectProfileType(userId: string, data: SelectProfileTypeInput, req?: Request) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const existing = await resolveProfileTypes(userId);
    if (existing.length > 0) {
      throw new BadRequestError("Profile type already selected");
    }

    await profileService.createProfile(userId, data.profileType);
    const profileTypes = await resolveProfileTypes(userId);
    const onboarding = await resolveOnboardingStatus(user, profileTypes);
    return issueAuthTokens(user, profileTypes, req, onboarding);
  }

  async refreshToken(data: RefreshTokenInput, req?: Request) {
    try {
      const decoded = verifyToken(data.refreshToken);

      const isSessionValid = await sessionService.validateRefreshSession(
        data.refreshToken,
      );
      if (!isSessionValid) {
        throw new UnauthorizedError(ApiMessages.INVALID_TOKEN);
      }

      const user = await User.findById(decoded.userId);
      if (!user) {
        throw new UnauthorizedError("User no longer exists");
      }

      assertUserCanLogin(user);

      const profileTypes = await resolveProfileTypes(user._id.toString());
      const jwtPayload = buildJwtPayload({
        userId: user._id.toString(),
        email: user.email,
        profileTypes,
        isSystemAdmin: user.isSystemAdmin,
      });

      const { accessToken, refreshToken } = generateTokens(jwtPayload);

      await sessionService.rotateRefreshSession(
        data.refreshToken,
        refreshToken,
        req,
      );

      return { accessToken, refreshToken };
    } catch {
      throw new UnauthorizedError(ApiMessages.INVALID_TOKEN);
    }
  }

  async getProfile(userId: string) {
    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const profileTypes = await resolveProfileTypes(userId);
    const onboarding = await resolveOnboardingStatus(user, profileTypes);
    return formatAuthUser(user, profileTypes, onboarding);
  }

  async logout(refreshToken?: string) {
    if (refreshToken) {
      await sessionService.revokeRefreshSession(refreshToken);
    }

    return { message: ApiMessages.LOGOUT_SUCCESS };
  }
}

export const authService = new AuthService();
