import { Request, Response, NextFunction } from "express";
import { UnauthorizedError, ForbiddenError } from "../utils/errors.js";
import { UserRole } from "../modules/user/user.schema.js";
import { authenticate, authorize, optionalAuth } from "./auth.js";

/**
 * Guard Functions - Composable authentication & authorization middleware
 * 
 * Usage:
 * - authGuard() - Require authentication
 * - roleGuard(UserRole.ADMIN) - Require specific role
 * - authGuard().and(roleGuard(UserRole.ADMIN)) - Chain guards
 * - publicRoute() - No authentication required
 * - optionalAuthGuard() - Optional authentication
 */

/**
 * Authentication Guard - Requires valid JWT token
 * @returns Middleware function
 */
export const authGuard = () => {
  return authenticate;
};

/**
 * Role Guard - Requires specific role(s)
 * @param allowedRoles - One or more allowed roles
 * @returns Middleware function
 */
export const roleGuard = (...allowedRoles: UserRole[]) => {
  return authorize(...allowedRoles);
};

/**
 * Optional Auth Guard - Optionally authenticates if token provided
 * @returns Middleware function
 */
export const optionalAuthGuard = () => {
  return optionalAuth;
};

/**
 * Admin Guard - Requires admin role
 * @returns Middleware function
 */
export const adminGuard = () => {
  return authorize(UserRole.ADMIN);
};

/**
 * Employer Guard - Requires employer role
 * @returns Middleware function
 */
export const employerGuard = () => {
  return authorize(UserRole.BUSINESS);
};

/**
 * Worker Guard - Requires worker role
 * @returns Middleware function
 */
export const workerGuard = () => {
  return authorize(UserRole.WORKER);
};

/**
 * Admin or Employer Guard - Requires admin or employer role
 * @returns Middleware function
 */
export const adminOrEmployerGuard = () => {
  return authorize(UserRole.ADMIN, UserRole.BUSINESS);
};

/**
 * Public Route - No authentication required
 * This is just for documentation/clarity
 * @returns Empty array (no middleware)
 */
export const publicRoute = () => {
  return [];
};

/**
 * Check if user has specific role
 * @param userRole - User's role
 * @param allowedRoles - Allowed roles
 * @returns True if user has allowed role
 */
export const hasRole = (userRole: UserRole | undefined, ...allowedRoles: UserRole[]): boolean => {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
};

/**
 * Check if user is admin
 * @param userRole - User's role
 * @returns True if user is admin
 */
export const isAdmin = (userRole: UserRole | undefined): boolean => {
  return userRole === UserRole.ADMIN;
};

/**
 * Check if user is employer
 * @param userRole - User's role
 * @returns True if user is employer
 */
export const isEmployer = (userRole: UserRole | undefined): boolean => {
  return userRole === UserRole.BUSINESS;
};

/**
 * Check if user is worker
 * @param userRole - User's role
 * @returns True if user is worker
 */
export const isWorker = (userRole: UserRole | undefined): boolean => {
  return userRole === UserRole.WORKER;
};

/**
 * Check if user is admin or employer
 * @param userRole - User's role
 * @returns True if user is admin or employer
 */
export const isAdminOrEmployer = (userRole: UserRole | undefined): boolean => {
  return userRole === UserRole.ADMIN || userRole === UserRole.BUSINESS;
};

/**
 * Require authentication middleware
 * Throws UnauthorizedError if user is not authenticated
 */
export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new UnauthorizedError("Authentication required"));
  }
  next();
};

/**
 * Require role middleware
 * Throws ForbiddenError if user doesn't have required role
 */
export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError("Authentication required"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError("You do not have permission to access this resource")
      );
    }

    next();
  };
};
