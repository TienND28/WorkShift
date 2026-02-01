import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";
import { type UserRole } from "../modules/user/user.schema.js";

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

/**
 * Generate access token
 */
export const generateAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, ENV.jwtSecret!, {
    expiresIn: ENV.jwtExpiresIn,
  } as jwt.SignOptions);
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, ENV.jwtSecret!, {
    expiresIn: ENV.jwtRefreshExpiresIn,
  } as jwt.SignOptions);
};

/**
 * Verify token
 */
export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, ENV.jwtSecret!) as JwtPayload;
};

/**
 * Generate both access and refresh tokens
 */
export const generateTokens = (payload: JwtPayload) => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

/**
 * Decode token without verification (useful for debugging)
 */
export const decodeToken = (token: string): JwtPayload | null => {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch (error) {
    return null;
  }
};
