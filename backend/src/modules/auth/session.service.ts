import type { Request } from "express";
import jwt from "jsonwebtoken";
import { ENV } from "../../config/env.js";
import { UserSession } from "../user/models/index.js";
import { hashToken } from "../../utils/tokenHash.js";

const parseRefreshExpiryMs = (): number => {
  const raw = ENV.jwtRefreshExpiresIn;
  const match = /^(\d+)([dhms])$/.exec(raw);
  if (!match) {
    return 7 * 24 * 60 * 60 * 1000;
  }

  const value = Number(match[1]);
  const unit = match[2];

  switch (unit) {
    case "d":
      return value * 24 * 60 * 60 * 1000;
    case "h":
      return value * 60 * 60 * 1000;
    case "m":
      return value * 60 * 1000;
    case "s":
      return value * 1000;
    default:
      return 7 * 24 * 60 * 60 * 1000;
  }
};

export class SessionService {
  getRefreshExpiryDate(): Date {
    return new Date(Date.now() + parseRefreshExpiryMs());
  }

  async createSession(
    userId: string,
    refreshToken: string,
    req?: Request,
  ): Promise<void> {
    await UserSession.create({
      userId,
      refreshTokenHash: hashToken(refreshToken),
      ...(req?.ip ? { ipAddress: req.ip } : {}),
      ...(req?.headers["user-agent"]
        ? { userAgent: req.headers["user-agent"] }
        : {}),
      expiredAt: this.getRefreshExpiryDate(),
    });
  }

  async validateRefreshSession(refreshToken: string): Promise<boolean> {
    const session = await UserSession.findOne({
      refreshTokenHash: hashToken(refreshToken),
      expiredAt: { $gt: new Date() },
    });

    return Boolean(session);
  }

  async rotateRefreshSession(
    oldRefreshToken: string,
    newRefreshToken: string,
    req?: Request,
  ): Promise<void> {
    await UserSession.deleteOne({
      refreshTokenHash: hashToken(oldRefreshToken),
    });

    const decoded = jwt.decode(oldRefreshToken) as { userId?: string } | null;
    if (!decoded?.userId) {
      return;
    }

    await this.createSession(decoded.userId, newRefreshToken, req);
  }

  async revokeRefreshSession(refreshToken: string): Promise<void> {
    await UserSession.deleteOne({
      refreshTokenHash: hashToken(refreshToken),
    });
  }
}

export const sessionService = new SessionService();
