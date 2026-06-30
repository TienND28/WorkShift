import mongoose from "mongoose";
import { OrganizationMemberRole } from "../../../common/enums/organizationMemberRole.enum.js";
import { slugify } from "../../../utils/slug.js";
import { User } from "../../user/models/user.model.js";
import { Industry } from "../../organization/industry/industry.model.js";
import {
  Organization,
  VerificationStatus,
} from "../../organization/organization.model.js";
import {
  OrganizationMember,
  OrganizationMemberStatus,
} from "../../organization/organizationMember.model.js";
import type { IEmployerProfile } from "../models/employerProfile.model.js";

async function ensureUniqueSlug(baseSlug: string, excludeId?: string) {
  let candidate = baseSlug;
  let suffix = 0;

  while (true) {
    const filter: Record<string, unknown> = {
      slug: candidate,
      isDeleted: false,
    };
    if (excludeId) {
      filter._id = { $ne: excludeId };
    }
    const exists = await Organization.exists(filter);
    if (!exists) return candidate;
    suffix += 1;
    candidate = `${baseSlug}-${suffix}`;
  }
}

async function resolveDefaultIndustryId(): Promise<mongoose.Types.ObjectId> {
  const industry =
    (await Industry.findOne({ code: "other", isActive: true, isDeleted: false })) ??
    (await Industry.findOne({ isActive: true, isDeleted: false }).sort({ createdAt: 1 }));

  if (!industry) {
    throw new Error("No industry found for default organization");
  }

  return industry._id;
}

export async function syncDefaultOrganization(
  userId: string,
  employerProfile: IEmployerProfile,
) {
  if (
    !employerProfile.businessName ||
    !employerProfile.address ||
    !employerProfile.provinceId ||
    !employerProfile.districtId ||
    !employerProfile.wardId ||
    !employerProfile.contactPhone ||
    !employerProfile.contactEmail
  ) {
    return null;
  }

  const owner = await User.findById(userId);
  if (!owner) return null;

  const industryId =
    employerProfile.organizationType ?? (await resolveDefaultIndustryId());
  let organization = employerProfile.defaultOrganizationId
    ? await Organization.findById(employerProfile.defaultOrganizationId)
    : null;

  if (!organization) {
    const existingMembership = await OrganizationMember.findOne({
      userId,
      status: OrganizationMemberStatus.ACTIVE,
    });

    if (existingMembership) {
      organization = await Organization.findById(existingMembership.organizationId);
      if (organization) {
        employerProfile.defaultOrganizationId = organization._id;
      }
    }
  }

  const orgPayload = {
    name: employerProfile.businessName,
    address: employerProfile.address,
    provinceId: employerProfile.provinceId,
    districtId: employerProfile.districtId,
    wardId: employerProfile.wardId,
    ...(employerProfile.coordinates
      ? { coordinates: employerProfile.coordinates }
      : {}),
    contactPhone: employerProfile.contactPhone,
    email: employerProfile.contactEmail.toLowerCase(),
    organizationType: industryId,
    ...(employerProfile.taxCode ? { taxCode: employerProfile.taxCode } : {}),
    ...(employerProfile.logo ? { logo: employerProfile.logo } : {}),
  };

  if (organization) {
    const slug =
      organization.name !== employerProfile.businessName
        ? await ensureUniqueSlug(
            slugify(employerProfile.businessName),
            organization._id.toString(),
          )
        : organization.slug;

    Object.assign(organization, orgPayload, { slug });
    await organization.save();
  } else {
    const slug = await ensureUniqueSlug(slugify(employerProfile.businessName));

    organization = await Organization.create({
      ownerId: userId,
      slug,
      verificationStatus: VerificationStatus.NONE,
      verificationLevel: 0,
      isActive: true,
      isDeleted: false,
      ...orgPayload,
    });

    await OrganizationMember.create({
      organizationId: organization._id,
      userId,
      inviteEmail: owner.email,
      role: OrganizationMemberRole.OWNER,
      status: OrganizationMemberStatus.ACTIVE,
      invitedBy: userId,
      joinedAt: new Date(),
    });

    employerProfile.defaultOrganizationId = organization._id;
  }

  return organization;
}
