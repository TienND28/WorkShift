import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";
import { ProfileType } from "../common/enums/profileType.enum.js";

export interface JwtPayload {
  userId: string;
  email: string;
  profileTypes: ProfileType[];
  isSystemAdmin: boolean;
  /** @deprecated Use profileTypes — kept for existing authorize() calls */
  role: "admin" | "employer" | "worker";
}

export const buildJwtPayload = (input: {
  userId: string;
  email: string;
  profileTypes: ProfileType[];
  isSystemAdmin: boolean;
}): JwtPayload => {
  let role: JwtPayload["role"] = "worker";
  if (input.isSystemAdmin) {
    role = "admin";
  } else if (input.profileTypes.includes(ProfileType.EMPLOYER)) {
    role = "employer";
  }

  return {
    userId: input.userId,
    email: input.email,
    profileTypes: input.profileTypes,
    isSystemAdmin: input.isSystemAdmin,
    role,
  };
};

export const generateAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, ENV.jwtSecret!, {
    expiresIn: ENV.jwtExpiresIn,
  } as jwt.SignOptions);
};

export const generateRefreshToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, ENV.jwtSecret!, {
    expiresIn: ENV.jwtRefreshExpiresIn,
  } as jwt.SignOptions);
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, ENV.jwtSecret!) as JwtPayload;
};

export const generateTokens = (payload: JwtPayload) => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

export const decodeToken = (token: string): JwtPayload | null => {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch {
    return null;
  }
};
