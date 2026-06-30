/**
 * @deprecated Import from `modules/user/models` instead.
 * Kept for backward compatibility during V2 migration.
 */
import { ProfileType } from "../../common/enums/profileType.enum.js";

export { User, type IUser } from "./models/user.model.js";

/** @deprecated Use ProfileType from common/enums */
export const UserRole = {
  ADMIN: "admin",
  BUSINESS: "employer",
  WORKER: "worker",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const profileTypeToLegacyRole = (
  profileTypes: ProfileType[],
  isSystemAdmin: boolean,
): UserRole => {
  if (isSystemAdmin) return UserRole.ADMIN;
  if (profileTypes.includes(ProfileType.EMPLOYER)) return UserRole.BUSINESS;
  return UserRole.WORKER;
};
