import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { OrganizationMemberRole } from "../../common/enums/organizationMemberRole.enum.js";
import { ForbiddenError, NotFoundError } from "../../utils/errors.js";
import { Organization } from "./organization.model.js";
import {
  OrganizationMember,
  OrganizationMemberStatus,
  type IOrganizationMember,
} from "./organizationMember.model.js";

declare global {
  namespace Express {
    interface Request {
      organizationMember?: IOrganizationMember;
    }
  }
}

const MANAGER_ROLES = new Set([
  OrganizationMemberRole.OWNER,
  OrganizationMemberRole.ADMIN,
]);

/** OWNER / ADMIN / RECRUITER — tạo tin tuyển, ca làm */
export const RECRUITING_ROLES = new Set([
  OrganizationMemberRole.OWNER,
  OrganizationMemberRole.ADMIN,
  OrganizationMemberRole.RECRUITER,
]);

export const requireOrganizationManager = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const member = await loadActiveMember(req);
    if (!MANAGER_ROLES.has(member.role)) {
      return next(
        new ForbiddenError("Only organization owner or admin can do this"),
      );
    }
    req.organizationMember = member;
    next();
  } catch (err) {
    next(err);
  }
};

export const requireOrganizationRecruiter = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const member = await loadActiveMember(req);
    if (!RECRUITING_ROLES.has(member.role)) {
      return next(
        new ForbiddenError(
          "Only owner, admin, or recruiter can manage job postings",
        ),
      );
    }
    req.organizationMember = member;
    next();
  } catch (err) {
    next(err);
  }
};

export const requireOrganizationMember = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    req.organizationMember = await loadActiveMember(req);
    next();
  } catch (err) {
    next(err);
  }
};

async function loadActiveMember(req: Request) {
  const userId = req.user?.userId;
  const organizationId = req.params.organizationId;

  if (!userId || !organizationId || Array.isArray(organizationId)) {
    throw new NotFoundError("Organization not found");
  }

  const orgId = String(organizationId);

  const organization = await Organization.findOne({
    _id: orgId,
    isDeleted: false,
  });

  if (!organization) {
    throw new NotFoundError("Organization not found");
  }

  const member = await OrganizationMember.findOne({
    organizationId: new mongoose.Types.ObjectId(orgId),
    userId: new mongoose.Types.ObjectId(userId),
    status: OrganizationMemberStatus.ACTIVE,
  });

  if (!member) {
    throw new ForbiddenError("You are not a member of this organization");
  }

  return member;
}
