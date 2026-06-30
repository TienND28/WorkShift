/**
 * Giới hạn hồ sơ worker theo gói — đồng bộ với backend `config/workerProfileLimits.ts`.
 * UI dùng hook `useWorkerProfileLimits` (ưu tiên API); file này là fallback khi chưa gọi API.
 */
export const WorkerMembershipTier = {
  FREE: "FREE",
  PREMIUM: "PREMIUM",
} as const;

export type WorkerMembershipTier =
  (typeof WorkerMembershipTier)[keyof typeof WorkerMembershipTier];

export type WorkerProfileLimits = {
  preferredProvinces: number;
  preferredIndustries: number;
  preferredPositions: number;
  preferredDistricts: number;
  availabilities: number;
};

export const WORKER_PROFILE_LIMITS_BY_TIER: Record<
  WorkerMembershipTier,
  WorkerProfileLimits
> = {
  FREE: {
    preferredProvinces: 2,
    preferredIndustries: 12,
    preferredPositions: 5,
    preferredDistricts: 30,
    availabilities: 21,
  },
  PREMIUM: {
    preferredProvinces: 6,
    preferredIndustries: 12,
    preferredPositions: 15,
    preferredDistricts: 60,
    availabilities: 42,
  },
};

export function getWorkerProfileLimits(
  tier: WorkerMembershipTier = WorkerMembershipTier.FREE,
): WorkerProfileLimits {
  return WORKER_PROFILE_LIMITS_BY_TIER[tier];
}

export const DEFAULT_WORKER_PROFILE_LIMITS = getWorkerProfileLimits();
