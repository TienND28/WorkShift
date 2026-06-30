import { WorkerMembershipTier } from "../common/enums/workerMembershipTier.enum.js";

/** Giới hạn một trường trên hồ sơ worker (theo gói). */
export interface WorkerProfileLimits {
  /** Số tỉnh/thành tối đa để mở rộng vùng tìm việc */
  preferredProvinces: number;
  /** Số ngành nghề ưa thích tối đa */
  preferredIndustries: number;
  /** Số vị trí công việc tối đa */
  preferredPositions: number;
  /** Số quận/huyện (khu vực) tối đa */
  preferredDistricts: number;
  /** Số khung giờ rảnh / ca làm tối đa */
  availabilities: number;
}

/**
 * Giới hạn theo gói — chỉnh tại đây khi bật Premium.
 * PREMIUM: tăng số lựa chọn vị trí, khu vực và khung giờ.
 */
export const WORKER_PROFILE_LIMITS_BY_TIER: Record<
  WorkerMembershipTier,
  WorkerProfileLimits
> = {
  [WorkerMembershipTier.FREE]: {
    preferredProvinces: 2,
    preferredIndustries: 12,
    preferredPositions: 5,
    preferredDistricts: 30,
    availabilities: 21,
  },
  [WorkerMembershipTier.PREMIUM]: {
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

/**
 * Xác định gói của user. Hiện tại mặc định FREE.
 * Sau này: đọc subscription / premiumUntil từ User hoặc bảng billing.
 */
export function resolveWorkerMembershipTier(
  _userId?: string,
): WorkerMembershipTier {
  void _userId;
  return WorkerMembershipTier.FREE;
}
