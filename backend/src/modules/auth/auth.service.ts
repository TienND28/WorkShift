import { User } from "../user/user.schema.js";
import { ApiMessages } from "../../constants/index.js";
import {
  generateTokens,
  verifyToken,
  hashPassword,
  comparePassword,
  ConflictError,
  UnauthorizedError,
  NotFoundError,
  BadRequestError,
} from "../../utils/index.js";
import {
  type RegisterInput,
  type LoginInput,
  type RefreshTokenInput,
  type UpdateProfileInput,
  type ChangePasswordInput,
} from "./auth.schema.js";

export class AuthService {
  /**
   * Register new user
   */
  async register(data: RegisterInput) {
    // Check if user already exists
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw new ConflictError(ApiMessages.EMAIL_ALREADY_EXISTS);
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create new user
    const user = await User.create({
      email: data.email,
      password: hashedPassword,
      name: data.name,
      role: data.role,
      ...(data.phone && { phone: data.phone }),
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        isVerified: user.isVerified,
        createdAt: user.createdAt as Date,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Login user
   */
  async login(data: LoginInput) {
    // Find user with password field
    const user = await User.findOne({ email: data.email }).select("+password");

    if (!user) {
      throw new UnauthorizedError(ApiMessages.INVALID_CREDENTIALS);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedError("Account is deactivated");
    }

    // Verify password
    const isPasswordValid = await comparePassword(data.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError(ApiMessages.INVALID_CREDENTIALS);
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        isVerified: user.isVerified,
        createdAt: user.createdAt as Date,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(data: RefreshTokenInput) {
    try {
      // Verify refresh token
      const decoded = verifyToken(data.refreshToken);

      // Check if user still exists
      const user = await User.findById(decoded.userId);
      if (!user) {
        throw new UnauthorizedError("User no longer exists");
      }

      if (!user.isActive) {
        throw new UnauthorizedError("Account is deactivated");
      }

      // Generate new tokens
      const { accessToken, refreshToken } = generateTokens({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      return { accessToken, refreshToken };
    } catch (error) {
      throw new UnauthorizedError(ApiMessages.INVALID_TOKEN);
    }
  }

  /**
   * Get user profile
   */
  async getProfile(userId: string) {
    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return {
      id: user._id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      isVerified: user.isVerified,
      isActive: user.isActive,
      createdAt: user.createdAt as Date,
      updatedAt: user.updatedAt as Date,
    };
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: UpdateProfileInput) {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return {
      id: user._id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      isVerified: user.isVerified,
      updatedAt: user.updatedAt as Date,
    };
  }

  /**
   * Change password
   */
  async changePassword(userId: string, data: ChangePasswordInput) {
    // Find user with password
    const user = await User.findById(userId).select("+password");

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Verify current password
    const isPasswordValid = await comparePassword(
      data.currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      throw new BadRequestError("Current password is incorrect");
    }

    // Update password
    const hashedPassword = await hashPassword(data.newPassword);
    user.password = hashedPassword;
    await user.save();

    return {
      message: ApiMessages.PASSWORD_CHANGED,
    };
  }
}

export const authService = new AuthService();
