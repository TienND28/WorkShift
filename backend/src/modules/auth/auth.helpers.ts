import type { Request } from "express";
import type { IUser } from "../user/models/user.model.js";
import type { GoogleUserInfo } from "./google.service.js";
import { UserStatus } from "../../common/enums/userStatus.enum.js";
import { UnauthorizedError } from "../../utils/errors.js";
import { ProfileType } from "../../common/enums/profileType.enum.js";
import { buildJwtPayload, generateTokens } from "../../utils/jwt.js";
import { profileService } from "../profile/profile.service.js";
import { sessionService } from "./session.service.js";
import type { OnboardingStatus } from "./onboarding.service.js";

export const assertUserCanLogin = (user: IUser) => {
  if (user.status !== UserStatus.ACTIVE) {
    throw new UnauthorizedError("Account is not active");
  }
};

/** Sync username, display name, and Gmail avatar on every login */
export const syncUserFromGoogle = (user: IUser, google: GoogleUserInfo) => {
  user.username = google.username;
  user.fullName = google.fullName;
  if (google.avatarUrl) {
    user.avatarUrl = google.avatarUrl;
  }
};

export const formatAuthUser = (
  user: IUser,
  profileTypes: ProfileType[],
  onboarding?: OnboardingStatus,
) => ({
  id: user._id.toString(),
  username: user.username,
  fullName: user.fullName,
  email: user.email,
  phone: user.phone,
  avatarUrl: user.avatarUrl,
  dateOfBirth: user.dateOfBirth?.toISOString().slice(0, 10) ?? null,
  gender: user.gender ?? null,
  status: user.status,
  profileTypes,
  isSystemAdmin: user.isSystemAdmin,
  lastLoginAt: user.lastLoginAt,
  createdAt: user.createdAt,
  onboarding: onboarding ?? {
    needsOnboarding: profileTypes.length === 0,
    stage: profileTypes.length === 0 ? "role" : "complete",
  },
});

export const issueAuthTokens = async (
  user: IUser,
  profileTypes: ProfileType[],
  req?: Request,
  onboarding?: OnboardingStatus,
) => {
  const jwtPayload = buildJwtPayload({
    userId: user._id.toString(),
    email: user.email,
    profileTypes,
    isSystemAdmin: user.isSystemAdmin,
  });

  const { accessToken, refreshToken } = generateTokens(jwtPayload);
  await sessionService.createSession(user._id.toString(), refreshToken, req);

  user.lastLoginAt = new Date();
  await user.save();

  return {
    user: formatAuthUser(user, profileTypes, onboarding),
    accessToken,
    refreshToken,
  };
};

export const resolveProfileTypes = async (userId: string) => {
  return profileService.getProfileTypesByUserId(userId);
};
