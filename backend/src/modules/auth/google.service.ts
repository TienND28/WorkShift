import { OAuth2Client } from "google-auth-library";
import { ENV } from "../../config/env.js";
import { BadRequestError, UnauthorizedError } from "../../utils/errors.js";
import {
  displayNameFromEmail,
  usernameFromEmail,
} from "../../utils/username.js";

export interface GoogleUserInfo {
  sub: string;
  email: string;
  emailVerified: boolean;
  username: string;
  fullName: string;
  avatarUrl?: string;
}

export class GoogleAuthService {
  private client: OAuth2Client;

  constructor() {
    if (!ENV.googleClientId) {
      throw new BadRequestError("Google sign-in is not configured");
    }
    this.client = new OAuth2Client(ENV.googleClientId);
  }

  async verifyIdToken(idToken: string): Promise<GoogleUserInfo> {
    if (!ENV.googleClientId) {
      throw new BadRequestError("Google OAuth is not configured");
    }

    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: ENV.googleClientId,
      });

      const payload = ticket.getPayload();
      if (!payload?.email || !payload.sub) {
        throw new UnauthorizedError("Invalid Google token");
      }

      if (!payload.email_verified) {
        throw new UnauthorizedError("Google email is not verified");
      }

      const email = payload.email.toLowerCase();
      const username = usernameFromEmail(email);

      const fullName =
        payload.name?.trim() || displayNameFromEmail(email);

      return {
        sub: payload.sub,
        email,
        emailVerified: Boolean(payload.email_verified),
        username,
        fullName,
        ...(payload.picture ? { avatarUrl: payload.picture } : {}),
      };
    } catch (error) {
      if (error instanceof UnauthorizedError || error instanceof BadRequestError) {
        throw error;
      }
      throw new UnauthorizedError("Google token verification failed");
    }
  }
}

export const googleAuthService = new GoogleAuthService();
