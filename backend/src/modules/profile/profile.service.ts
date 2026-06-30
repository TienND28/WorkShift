import { ProfileType } from "../../common/enums/index.js";
import {
  UserProfile,
  WorkerProfile,
  EmployerProfile,
} from "./models/index.js";

export class ProfileService {
  async getProfileTypesByUserId(userId: string): Promise<ProfileType[]> {
    const profiles = await UserProfile.find({ userId }).select("type").lean();
    return profiles.map((p) => p.type as ProfileType);
  }

  async createProfile(userId: string, type: ProfileType) {
    const existing = await UserProfile.findOne({ userId, type });
    if (existing) {
      return existing;
    }

    const profile = await UserProfile.create({ userId, type });

    if (type === ProfileType.WORKER) {
      await WorkerProfile.create({ profileId: profile._id });
    } else if (type === ProfileType.EMPLOYER) {
      await EmployerProfile.create({ profileId: profile._id });
    }

    return profile;
  }
}

export const profileService = new ProfileService();
