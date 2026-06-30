import { ProfileType } from "../../common/enums/profileType.enum.js";
import type { IUser } from "../user/models/user.model.js";
import {
  EmployerProfile,
  UserProfile,
  WorkerProfile,
} from "../profile/models/index.js";
import { isEmployerProfileComplete } from "../profile/employer/employer.service.js";

export type OnboardingStage =
  | "role"
  | "worker_setup"
  | "employer_setup"
  | "complete";

export interface OnboardingStatus {
  needsOnboarding: boolean;
  stage: OnboardingStage;
  profileType?: ProfileType;
}

async function isWorkerProfileComplete(userId: string): Promise<boolean> {
  const userProfile = await UserProfile.findOne({
    userId,
    type: ProfileType.WORKER,
  });
  if (!userProfile) return false;

  const worker = await WorkerProfile.findOne({ profileId: userProfile._id });
  if (!worker) return false;

  return (
    (worker.preferredPositionIds?.length ?? 0) > 0 &&
    (worker.preferredDistrictIds?.length ?? 0) > 0 &&
    (worker.availabilities?.length ?? 0) > 0
  );
}

async function isEmployerSetupComplete(userId: string): Promise<boolean> {
  const userProfile = await UserProfile.findOne({
    userId,
    type: ProfileType.EMPLOYER,
  });
  if (!userProfile) return false;

  const employer = await EmployerProfile.findOne({
    profileId: userProfile._id,
  });
  if (!employer) return false;

  return isEmployerProfileComplete(employer);
}

export async function resolveOnboardingStatus(
  user: IUser,
  profileTypes: ProfileType[],
): Promise<OnboardingStatus> {
  const userId = user._id.toString();

  if (profileTypes.length === 0) {
    return { needsOnboarding: true, stage: "role" };
  }

  const primaryType = profileTypes.includes(ProfileType.EMPLOYER)
    ? ProfileType.EMPLOYER
    : ProfileType.WORKER;

  if (primaryType === ProfileType.WORKER) {
    const workerComplete = await isWorkerProfileComplete(userId);
    const personalComplete = Boolean(user.dateOfBirth?.getTime());
    if (!personalComplete || !workerComplete) {
      return {
        needsOnboarding: true,
        stage: "worker_setup",
        profileType: ProfileType.WORKER,
      };
    }
    return {
      needsOnboarding: false,
      stage: "complete",
      profileType: ProfileType.WORKER,
    };
  }

  const employerComplete = await isEmployerSetupComplete(userId);

  if (!employerComplete) {
    return {
      needsOnboarding: true,
      stage: "employer_setup",
      profileType: ProfileType.EMPLOYER,
    };
  }

  return {
    needsOnboarding: false,
    stage: "complete",
    profileType: ProfileType.EMPLOYER,
  };
}
