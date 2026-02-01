import { Router } from 'express';
import {
    registerSchema,
    loginSchema,
    refreshTokenSchema,
    updateProfileSchema,
    changePasswordSchema,
} from './auth.schema.js';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/auth.js';
import { AuthController } from './auth.controller.js';

const router = Router();

/**
 * Public routes
 */

// POST /api/auth/register - Register new user
router.post(
    '/register',
    validate(registerSchema),
    AuthController.register
);

// POST /api/auth/login - Login user
router.post(
    '/login',
    validate(loginSchema),
    AuthController.login
);

// POST /api/auth/refresh - Refresh access token
router.post(
    '/refresh',
    validate(refreshTokenSchema),
    AuthController.refreshToken
);

/**
 * Protected routes (require authentication)
 */

// GET /api/auth/me - Get current user profile
router.get(
    '/me',
    authenticate,
    AuthController.getProfile
);

// PUT /api/auth/profile - Update user profile
router.put(
    '/profile',
    authenticate,
    validate(updateProfileSchema),
    AuthController.updateProfile
);

// POST /api/auth/change-password - Change password
router.post(
    '/change-password',
    authenticate,
    validate(changePasswordSchema),
    AuthController.changePassword
);

// POST /api/auth/logout - Logout (client-side)
router.post(
    '/logout',
    authenticate,
    AuthController.logout
);

export default router;
