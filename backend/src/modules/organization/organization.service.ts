import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import { ProfileType } from "../../common/enums/profileType.enum.js";
import { OrganizationMemberRole } from "../../common/enums/organizationMemberRole.enum.js";
import { ApiMessages } from "../../constants/index.js";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../../utils/errors.js";
import { slugify } from "../../utils/slug.js";
import { District } from "../location/district.model.js";
import { Province } from "../location/province.model.js";
import { Ward } from "../location/ward.model.js";
import { User } from "../user/models/user.model.js";
import { UserProfile } from "../profile/models/userProfile.model.js";
import { Industry } from "./industry/industry.model.js";
import {
  Organization,
  VerificationStatus,
  type IOrganization,
} from "./organization.model.js";
import {
  OrganizationMember,
  OrganizationMemberStatus,
  type IOrganizationMember,
} from "./organizationMember.model.js";
import type {
  CreateOrganizationInput,
  InviteMemberInput,
  UpdateMemberRoleInput,
  UpdateOrganizationInput,
} from "./organization.schema.js";

type PopulatedIndustry = { _id: mongoose.Types.ObjectId; code: string; name: string };

const formatOrganization = (org: IOrganization) => {
  const industry = org.organizationType as unknown as PopulatedIndustry;

  return {
    id: org._id.toString(),
    ownerId: org.ownerId.toString(),
    name: org.name,
    slug: org.slug,
    description: org.description ?? null,
    logo: org.logo ?? null,
    coverImage: org.coverImage ?? null,
    organizationType:
      industry && typeof industry === "object" && "code" in industry
        ? {
            id: industry._id.toString(),
            code: industry.code,
            name: industry.name,
          }
        : { id: org.organizationType.toString() },
    address: org.address,
    provinceId: org.provinceId.toString(),
    districtId: org.districtId.toString(),
    wardId: org.wardId.toString(),
    coordinates: org.coordinates ?? null,
    contactPhone: org.contactPhone,
    email: org.email,
    website: org.website ?? null,
    socialLinks: org.socialLinks ?? [],
    taxCode: org.taxCode ?? null,
    verificationStatus: org.verificationStatus,
    verificationLevel: org.verificationLevel,
    isActive: org.isActive,
    createdAt: (org as IOrganization & { createdAt?: Date }).createdAt,
    updatedAt: (org as IOrganization & { updatedAt?: Date }).updatedAt,
  };
};

const formatMember = (member: IOrganizationMember) => ({
  id: member._id.toString(),
  organizationId: member.organizationId.toString(),
  userId: member.userId?.toString() ?? null,
  inviteEmail: member.inviteEmail,
  role: member.role,
  status: member.status,
  invitedBy: member.invitedBy.toString(),
  invitedAt: member.invitedAt,
  joinedAt: member.joinedAt ?? null,
});

async function ensureEmployerProfile(userId: string) {
  const profile = await UserProfile.findOne({
    userId,
    type: ProfileType.EMPLOYER,
  });
  if (!profile) {
    throw new ForbiddenError(
      "Employer profile required. Create one at POST /api/employer/profile",
    );
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

async function validateIndustry(industryId: string) {
  const industry = await Industry.findOne({
    _id: industryId,
    isActive: true,
    isDeleted: false,
  });
  if (!industry) {
    throw new BadRequestError("Invalid organization type (industry)");
  }
}

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

export class OrganizationService {
  getMemberRoles() {
    return Object.values(OrganizationMemberRole).map((role) => ({
      value: role,
      label: role,
      assignable: role !== OrganizationMemberRole.OWNER,
    }));
  }

  async create(userId: string, data: CreateOrganizationInput) {
    await ensureEmployerProfile(userId);
    await validateIndustry(data.organizationType);
    await validateLocation(
      data.provinceId,
      data.districtId,
      data.wardId,
    );

    const baseSlug = data.slug ?? slugify(data.name);
    const slug = await ensureUniqueSlug(baseSlug);

    const owner = await User.findById(userId);
    if (!owner) {
      throw new NotFoundError("User not found");
    }

    const organization = await Organization.create({
      ownerId: userId,
      name: data.name,
      slug,
      ...(data.description !== undefined ? { description: data.description } : {}),
      organizationType: data.organizationType,
      address: data.address,
      provinceId: data.provinceId,
      districtId: data.districtId,
      wardId: data.wardId,
      ...(data.coordinates !== undefined ? { coordinates: data.coordinates } : {}),
      contactPhone: data.contactPhone,
      email: data.email.toLowerCase(),
      ...(data.website !== undefined ? { website: data.website } : {}),
      ...(data.socialLinks !== undefined ? { socialLinks: data.socialLinks } : {}),
      ...(data.taxCode !== undefined ? { taxCode: data.taxCode } : {}),
      verificationStatus: VerificationStatus.NONE,
      ...(data.verificationLevel !== undefined
        ? { verificationLevel: data.verificationLevel }
        : {}),
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

    const populated = await organization.populate("organizationType", "code name");

    return formatOrganization(populated);
  }

  async listMine(userId: string) {
    const memberships = await OrganizationMember.find({
      userId,
      status: OrganizationMemberStatus.ACTIVE,
    }).select("organizationId role");

    const orgIds = memberships.map((m) => m.organizationId);
    const organizations = await Organization.find({
      _id: { $in: orgIds },
      isDeleted: false,
    }).populate("organizationType", "code name");

    const roleByOrg = new Map(
      memberships.map((m) => [m.organizationId.toString(), m.role]),
    );

    return organizations.map((org) => ({
      ...formatOrganization(org),
      myRole: roleByOrg.get(org._id.toString()),
    }));
  }

  async getById(userId: string, organizationId: string) {
    await this.assertMember(userId, organizationId);

    const organization = await Organization.findOne({
      _id: organizationId,
      isDeleted: false,
    }).populate("organizationType", "code name");

    if (!organization) {
      throw new NotFoundError("Organization not found");
    }

    return formatOrganization(organization);
  }

  async update(
    userId: string,
    organizationId: string,
    data: UpdateOrganizationInput,
  ) {
    await this.assertManager(userId, organizationId);

    const organization = await Organization.findOne({
      _id: organizationId,
      isDeleted: false,
    });

    if (!organization) {
      throw new NotFoundError("Organization not found");
    }

    if (data.organizationType) {
      await validateIndustry(data.organizationType);
      organization.organizationType = new mongoose.Types.ObjectId(
        data.organizationType,
      );
    }

    if (data.provinceId || data.districtId || data.wardId) {
      await validateLocation(
        data.provinceId ?? organization.provinceId.toString(),
        data.districtId ?? organization.districtId.toString(),
        data.wardId ?? organization.wardId.toString(),
      );
    }

    if (data.name !== undefined) organization.name = data.name;
    if (data.description !== undefined) organization.description = data.description;
    if (data.address !== undefined) organization.address = data.address;
    if (data.provinceId !== undefined) {
      organization.provinceId = new mongoose.Types.ObjectId(data.provinceId);
    }
    if (data.districtId !== undefined) {
      organization.districtId = new mongoose.Types.ObjectId(data.districtId);
    }
    if (data.wardId !== undefined) {
      organization.wardId = new mongoose.Types.ObjectId(data.wardId);
    }
    if (data.coordinates !== undefined) {
      organization.coordinates = data.coordinates;
    }
    if (data.contactPhone !== undefined) {
      organization.contactPhone = data.contactPhone;
    }
    if (data.email !== undefined) organization.email = data.email.toLowerCase();
    if (data.website !== undefined) organization.website = data.website;
    if (data.socialLinks !== undefined) {
      organization.socialLinks = data.socialLinks;
    }
    if (data.taxCode !== undefined) organization.taxCode = data.taxCode;

    if (data.slug !== undefined) {
      organization.slug = await ensureUniqueSlug(data.slug, organizationId);
    } else if (data.name !== undefined) {
      organization.slug = await ensureUniqueSlug(
        slugify(data.name),
        organizationId,
      );
    }

    await organization.save();

    const populated = await Organization.findById(organization._id).populate(
      "organizationType",
      "code name",
    );

    return {
      organization: formatOrganization(populated!),
      message: ApiMessages.RESOURCE_UPDATED,
    };
  }

  async uploadLogo(
    userId: string,
    organizationId: string,
    filename: string,
  ) {
    await this.assertManager(userId, organizationId);

    const organization = await Organization.findOne({
      _id: organizationId,
      isDeleted: false,
    });

    if (!organization) {
      throw new NotFoundError("Organization not found");
    }

    if (organization.logo) {
      const oldPath = path.join(
        process.cwd(),
        organization.logo.replace(/^\//, ""),
      );
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    organization.logo = `/uploads/organizations/${filename}`;
    await organization.save();

    return {
      logo: organization.logo,
      message: ApiMessages.RESOURCE_UPDATED,
    };
  }

  async listMembers(userId: string, organizationId: string) {
    await this.assertMember(userId, organizationId);

    const members = await OrganizationMember.find({
      organizationId,
      status: { $ne: OrganizationMemberStatus.REMOVED },
    }).sort({ role: 1, createdAt: 1 });

    return members.map(formatMember);
  }

  async inviteMember(
    userId: string,
    organizationId: string,
    data: InviteMemberInput,
  ) {
    await this.assertManager(userId, organizationId);

    const email = data.email.toLowerCase();
    const inviter = await User.findById(userId);
    if (!inviter) {
      throw new NotFoundError("User not found");
    }

    const targetUser = await User.findOne({ email });

    const existing = await OrganizationMember.findOne({
      organizationId,
      $or: [
        { inviteEmail: email },
        ...(targetUser ? [{ userId: targetUser._id }] : []),
      ],
      status: { $ne: OrganizationMemberStatus.REMOVED },
    });

    if (existing) {
      throw new ConflictError("User is already invited or is a member");
    }

    const memberPayload: Record<string, unknown> = {
      organizationId,
      inviteEmail: email,
      role: data.role,
      status: targetUser
        ? OrganizationMemberStatus.ACTIVE
        : OrganizationMemberStatus.PENDING,
      invitedBy: userId,
    };
    if (targetUser) {
      memberPayload.userId = targetUser._id;
      memberPayload.joinedAt = new Date();
    }

    const member = await OrganizationMember.create(memberPayload);

    return formatMember(member);
  }

  async updateMemberRole(
    userId: string,
    organizationId: string,
    memberId: string,
    data: UpdateMemberRoleInput,
  ) {
    await this.assertManager(userId, organizationId);

    const member = await OrganizationMember.findOne({
      _id: memberId,
      organizationId,
      status: { $ne: OrganizationMemberStatus.REMOVED },
    });

    if (!member) {
      throw new NotFoundError("Member not found");
    }

    if (member.role === OrganizationMemberRole.OWNER) {
      throw new ForbiddenError("Cannot change the organization owner's role");
    }

    member.role = data.role;
    await member.save();

    return {
      member: formatMember(member),
      message: ApiMessages.RESOURCE_UPDATED,
    };
  }

  private async assertMember(userId: string, organizationId: string) {
    const member = await OrganizationMember.findOne({
      organizationId,
      userId,
      status: OrganizationMemberStatus.ACTIVE,
    });
    if (!member) {
      throw new ForbiddenError("You are not a member of this organization");
    }
    return member;
  }

  private async assertManager(userId: string, organizationId: string) {
    const member = await this.assertMember(userId, organizationId);
    if (
      member.role !== OrganizationMemberRole.OWNER &&
      member.role !== OrganizationMemberRole.ADMIN
    ) {
      throw new ForbiddenError("Only organization owner or admin can do this");
    }
    return member;
  }
}

export const organizationService = new OrganizationService();
