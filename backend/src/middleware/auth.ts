import { Request, Response, NextFunction } from "express";
import { verifyToken, JwtPayload } from "../utils/jwt.js";
import { UnauthorizedError, ForbiddenError } from "../utils/errors.js";
import { User, UserRole } from "../modules/user/user.schema.js";

/**
 * Extend Express Request to include user
 */
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Authenticate user from JWT token
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("No token provided");
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyToken(token);

    // Check if user still exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new UnauthorizedError("User no longer exists");
    }

    if (!user.isActive) {
      throw new UnauthorizedError("User account is deactivated");
    }

    // Attach user to request
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return next(error);
    }
    next(new UnauthorizedError("Invalid or expired token"));
  }
};

/**
 * Authorize user based on roles
 * @param allowedRoles - One or more allowed roles
 * @returns Middleware function that checks if user has required role
 *
 * @example
 * router.get('/admin', authenticate, authorize(UserRole.ADMIN), controller.getAdmin);
 * router.post('/create', authenticate, authorize(UserRole.ADMIN, UserRole.BUSINESS), controller.create);
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError("Authentication required"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          "You do not have permission to access this resource",
        ),
      );
    }

    next();
  };
};

/**
 * Optional authentication - doesn't throw error if no token
 * Useful for routes that work both with and without authentication
 *
 * @example
 * router.get('/public', optionalAuth, controller.getPublic); // Works with or without token
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      try {
        const decoded = verifyToken(token);
        // Optionally check if user still exists and is active
        const user = await User.findById(decoded.userId);
        if (user && user.isActive) {
          req.user = decoded;
        }
      } catch (error) {
        // Silently ignore token errors for optional auth
      }
    }

    next();
  } catch (error) {
    // Ignore all errors for optional auth
    next();
  }
};
