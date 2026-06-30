import { User, type IUser } from "./models/user.model.js";
import { NotFoundError } from "../../utils/errors.js";
import type { UpdateUserInput } from "./user.update.schema.js";
import { formatAuthUser, resolveProfileTypes } from "../auth/auth.helpers.js";
import { resolveOnboardingStatus } from "../auth/onboarding.service.js";

export class UserService {
  async updateMe(userId: string, data: UpdateUserInput) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (data.fullName !== undefined) user.fullName = data.fullName;
    if (data.phone !== undefined) user.phone = data.phone;
    if (data.gender !== undefined) user.gender = data.gender;
    if (data.dateOfBirth !== undefined) {
      user.dateOfBirth = new Date(`${data.dateOfBirth}T00:00:00.000Z`);
    }

    await user.save();

    const profileTypes = await resolveProfileTypes(userId);
    const onboarding = await resolveOnboardingStatus(user, profileTypes);
    return formatAuthUser(user, profileTypes, onboarding);
  }

  async updateAvatar(userId: string, avatarPath: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    user.avatarUrl = avatarPath;
    await user.save();

    const profileTypes = await resolveProfileTypes(userId);
    const onboarding = await resolveOnboardingStatus(user, profileTypes);
    return formatAuthUser(user, profileTypes, onboarding);
  }
}

export const userService = new UserService();
