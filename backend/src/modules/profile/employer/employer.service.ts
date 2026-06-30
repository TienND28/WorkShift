import crypto from "crypto";
import fs from "fs";
import mongoose from "mongoose";
import path from "path";
import { ProfileType } from "../../../common/enums/index.js";
import { RecruiterTitle } from "../../../common/enums/recruiterTitle.enum.js";
import { ApiMessages } from "../../../constants/index.js";
import {
  BadRequestError,
  NotFoundError,
  TooManyRequestsError,
} from "../../../utils/errors.js";
import { hashToken } from "../../../utils/tokenHash.js";
import { District } from "../../location/district.model.js";
import { Province } from "../../location/province.model.js";
import { Ward } from "../../location/ward.model.js";
import { Industry } from "../../organization/industry/industry.model.js";
import { User } from "../../user/models/user.model.js";
import {
  EmailVerification,
  EmailVerificationPurpose,
} from "../models/emailVerification.model.js";
import {
  EmployerProfile,
  type IEmployerProfile,
} from "../models/employerProfile.model.js";
import { UserProfile } from "../models/userProfile.model.js";
import { profileService } from "../profile.service.js";
import { sendEmployerEmailOtp } from "../../../services/email.service.js";
import { syncDefaultOrganization } from "./employer-org-sync.service.js";
import type {
  SendEmployerEmailOtpInput,
  UpdateEmployerProfileInput,
  VerifyEmployerEmailOtpInput,
} from "./employer.schema.js";

const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;

const recruiterTitleLabels: Record<RecruiterTitle, string> = {
  [RecruiterTitle.OWNER]: "Chủ cửa hàng / Chủ doanh nghiệp",
  [RecruiterTitle.MANAGER]: "Quản lý",
  [RecruiterTitle.HR]: "Nhân sự (HR)",
  [RecruiterTitle.OTHER]: "Khác",
};

export function isEmployerProfileComplete(
  profile: IEmployerProfile,
): boolean {
  return Boolean(
      profile.setupCompletedAt &&
      profile.businessName &&
      profile.organizationType &&
      profile.recruiterName &&
      profile.address &&
      profile.provinceId &&
      profile.districtId &&
      profile.wardId &&
      profile.coordinates &&
      profile.contactPhone &&
      profile.contactEmail &&
      profile.contactEmailVerified,
  );
}

function formatEmployerProfile(
  doc: IEmployerProfile,
  userProfileId: string,
) {
  return {
    id: doc._id.toString(),
    profileId: userProfileId,
    businessName: doc.businessName ?? null,
    organizationType: doc.organizationType?.toString() ?? null,
    taxCode: doc.taxCode ?? null,
    recruiterName: doc.recruiterName ?? null,
    recruiterTitle: doc.recruiterTitle ?? null,
    recruiterTitleOther: doc.recruiterTitleOther ?? null,
    recruiterTitleLabel: doc.recruiterTitle
      ? recruiterTitleLabels[doc.recruiterTitle]
      : null,
    address: doc.address ?? null,
    provinceId: doc.provinceId?.toString() ?? null,
    districtId: doc.districtId?.toString() ?? null,
    wardId: doc.wardId?.toString() ?? null,
    coordinates: doc.coordinates ?? null,
    contactPhone: doc.contactPhone ?? null,
    contactEmail: doc.contactEmail ?? null,
    contactEmailVerified: doc.contactEmailVerified,
    contactEmailVerifiedAt: doc.contactEmailVerifiedAt ?? null,
    logo: doc.logo ?? null,
    defaultOrganizationId: doc.defaultOrganizationId?.toString() ?? null,
    setupCompletedAt: doc.setupCompletedAt ?? null,
    isComplete: isEmployerProfileComplete(doc),
    createdAt: doc.createdAt,
  };
}

async function getEmployerProfileOrThrow(userId: string) {
  const userProfile = await UserProfile.findOne({
    userId,
    type: ProfileType.EMPLOYER,
  });

  if (!userProfile) {
    throw new NotFoundError("Employer profile not found");
  }

  let employerProfile = await EmployerProfile.findOne({
    profileId: userProfile._id,
  });

  if (!employerProfile) {
    employerProfile = await EmployerProfile.create({
      profileId: userProfile._id,
    });
  }

  return { userProfile, employerProfile };
}

async function validateIndustry(industryId: string) {
  const industry = await Industry.findOne({
    _id: industryId,
    isActive: true,
    isDeleted: false,
  });

  if (!industry) {
    throw new BadRequestError("Invalid organization type");
  }
}

async function validateLocation(
  provinceId: string,
  districtId: string,
  wardId: string,
) {
  const [province, district, ward] = await Promise.all([
    Province.findById(provinceId),
    District.findById(districtId),
    Ward.findById(wardId),
  ]);

  if (!province) {
    throw new BadRequestError("Invalid province");
  }
  if (!district || district.provinceId.toString() !== provinceId) {
    throw new BadRequestError("Invalid district for province");
  }
  if (!ward || ward.districtId.toString() !== districtId) {
    throw new BadRequestError("Invalid ward for district");
  }
}

function generateOtp(): string {
  return String(crypto.randomInt(100000, 1000000));
}

async function tryCompleteSetup(
  userId: string,
  employerProfile: IEmployerProfile,
) {
  if (
    !employerProfile.businessName ||
    !employerProfile.organizationType ||
    !employerProfile.recruiterName ||
    !employerProfile.address ||
    !employerProfile.provinceId ||
    !employerProfile.districtId ||
    !employerProfile.wardId ||
    !employerProfile.coordinates ||
    !employerProfile.contactPhone ||
    !employerProfile.contactEmail ||
    !employerProfile.contactEmailVerified
  ) {
    return employerProfile;
  }

  await syncDefaultOrganization(userId, employerProfile);

  if (!employerProfile.setupCompletedAt) {
    employerProfile.setupCompletedAt = new Date();
  }

  await employerProfile.save();
  return employerProfile;
}

export class EmployerService {
  async createProfile(userId: string) {
    let userProfile = await UserProfile.findOne({
      userId,
      type: ProfileType.EMPLOYER,
    });

    if (!userProfile) {
      userProfile = await profileService.createProfile(
        userId,
        ProfileType.EMPLOYER,
      );
    }

    const employerProfile = await EmployerProfile.findOne({
      profileId: userProfile._id,
    });

    if (!employerProfile) {
      throw new NotFoundError("Employer profile details not found");
    }

    return formatEmployerProfile(
      employerProfile,
      userProfile._id.toString(),
    );
  }

  async getProfile(userId: string) {
    const { userProfile, employerProfile } =
      await getEmployerProfileOrThrow(userId);
    return formatEmployerProfile(
      employerProfile,
      userProfile._id.toString(),
    );
  }

  async updateProfile(userId: string, data: UpdateEmployerProfileInput) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    await validateLocation(data.provinceId, data.districtId, data.wardId);
    await validateIndustry(data.organizationType);

    const { userProfile, employerProfile } =
      await getEmployerProfileOrThrow(userId);

    const normalizedEmail = data.contactEmail.toLowerCase();
    const emailChanged =
      employerProfile.contactEmail?.toLowerCase() !== normalizedEmail;

    employerProfile.businessName = data.businessName;
    employerProfile.organizationType = new mongoose.Types.ObjectId(
      data.organizationType,
    );
    if (data.taxCode !== undefined) {
      employerProfile.taxCode = data.taxCode;
    } else {
      employerProfile.set("taxCode", undefined);
    }
    employerProfile.recruiterName = data.recruiterName;
    if (data.recruiterTitle !== undefined) {
      employerProfile.recruiterTitle = data.recruiterTitle;
    }
    if (data.recruiterTitleOther !== undefined) {
      employerProfile.recruiterTitleOther = data.recruiterTitleOther;
    }
    employerProfile.address = data.address;
    employerProfile.provinceId = new mongoose.Types.ObjectId(data.provinceId);
    employerProfile.districtId = new mongoose.Types.ObjectId(data.districtId);
    employerProfile.wardId = new mongoose.Types.ObjectId(data.wardId);
    employerProfile.coordinates = data.coordinates;
    employerProfile.contactPhone = data.contactPhone;
    employerProfile.contactEmail = normalizedEmail;

    if (emailChanged) {
      employerProfile.contactEmailVerified = false;
      employerProfile.set("contactEmailVerifiedAt", undefined);
    }

    if (
      normalizedEmail === user.email.toLowerCase() &&
      (emailChanged || !employerProfile.contactEmailVerified)
    ) {
      employerProfile.contactEmailVerified = true;
      employerProfile.contactEmailVerifiedAt = new Date();
    }

    await employerProfile.save();
    await tryCompleteSetup(userId, employerProfile);

    return formatEmployerProfile(
      employerProfile,
      userProfile._id.toString(),
    );
  }

  async sendEmailOtp(userId: string, data: SendEmployerEmailOtpInput) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const normalizedEmail = data.email.toLowerCase();

    if (normalizedEmail === user.email.toLowerCase()) {
      const { userProfile, employerProfile } =
        await getEmployerProfileOrThrow(userId);
      employerProfile.contactEmail = normalizedEmail;
      employerProfile.contactEmailVerified = true;
      employerProfile.contactEmailVerifiedAt = new Date();
      await employerProfile.save();
      await tryCompleteSetup(userId, employerProfile);

      return {
        autoVerified: true,
        message: "Email trùng với tài khoản đăng nhập — đã xác thực tự động",
        profile: formatEmployerProfile(
          employerProfile,
          userProfile._id.toString(),
        ),
      };
    }

    const recent = await EmailVerification.findOne({
      userId,
      purpose: EmailVerificationPurpose.EMPLOYER_CONTACT_EMAIL,
      email: normalizedEmail,
    }).sort({ createdAt: -1 });

    if (
      recent &&
      Date.now() - recent.createdAt.getTime() < OTP_RESEND_COOLDOWN_MS
    ) {
      throw new TooManyRequestsError(
        "Vui lòng đợi 60 giây trước khi gửi lại mã",
      );
    }

    const otp = generateOtp();

    await EmailVerification.deleteMany({
      userId,
      purpose: EmailVerificationPurpose.EMPLOYER_CONTACT_EMAIL,
      email: normalizedEmail,
    });

    await EmailVerification.create({
      userId,
      email: normalizedEmail,
      otpHash: hashToken(otp),
      purpose: EmailVerificationPurpose.EMPLOYER_CONTACT_EMAIL,
      attempts: 0,
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    });

    await sendEmployerEmailOtp(normalizedEmail, otp);

    return {
      autoVerified: false,
      message: "Đã gửi mã xác thực tới email",
    };
  }

  async verifyEmailOtp(userId: string, data: VerifyEmployerEmailOtpInput) {
    const normalizedEmail = data.email.toLowerCase();

    const record = await EmailVerification.findOne({
      userId,
      purpose: EmailVerificationPurpose.EMPLOYER_CONTACT_EMAIL,
      email: normalizedEmail,
    }).sort({ createdAt: -1 });

    if (!record || record.expiresAt.getTime() < Date.now()) {
      throw new BadRequestError("Mã xác thực không hợp lệ hoặc đã hết hạn");
    }

    if (record.attempts >= OTP_MAX_ATTEMPTS) {
      throw new BadRequestError("Đã nhập sai quá số lần cho phép");
    }

    if (hashToken(data.otp) !== record.otpHash) {
      record.attempts += 1;
      await record.save();
      throw new BadRequestError("Mã xác thực không đúng");
    }

    await EmailVerification.deleteMany({
      userId,
      purpose: EmailVerificationPurpose.EMPLOYER_CONTACT_EMAIL,
      email: normalizedEmail,
    });

    const { userProfile, employerProfile } =
      await getEmployerProfileOrThrow(userId);

    employerProfile.contactEmail = normalizedEmail;
    employerProfile.contactEmailVerified = true;
    employerProfile.contactEmailVerifiedAt = new Date();
    await employerProfile.save();
    await tryCompleteSetup(userId, employerProfile);

    return {
      message: "Xác thực email thành công",
      profile: formatEmployerProfile(
        employerProfile,
        userProfile._id.toString(),
      ),
    };
  }

  async uploadLogo(userId: string, filename: string) {
    const { userProfile, employerProfile } =
      await getEmployerProfileOrThrow(userId);

    if (employerProfile.logo) {
      const oldPath = path.join(
        process.cwd(),
        employerProfile.logo.replace(/^\//, ""),
      );
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    employerProfile.logo = `/uploads/employers/${filename}`;
    await employerProfile.save();

    if (employerProfile.setupCompletedAt) {
      await syncDefaultOrganization(userId, employerProfile);
    }

    return {
      logo: employerProfile.logo,
      profile: formatEmployerProfile(
        employerProfile,
        userProfile._id.toString(),
      ),
      message: ApiMessages.PROFILE_UPDATED,
    };
  }
}

export const employerService = new EmployerService();
