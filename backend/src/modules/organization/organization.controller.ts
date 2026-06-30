import { type Request, type Response, type NextFunction } from "express";
import { ApiMessages } from "../../constants/index.js";
import {
  sendCreated,
  sendSuccess,
} from "../../common/response/response.util.js";
import { BadRequestError } from "../../utils/errors.js";
import type {
  CreateOrganizationInput,
  InviteMemberInput,
  UpdateMemberRoleInput,
  UpdateOrganizationInput,
} from "./organization.schema.js";
import { organizationService } from "./organization.service.js";

export const OrganizationController = {
  async getMemberRoles(req: Request, res: Response, next: NextFunction) {
    try {
      const result = organizationService.getMemberRoles();
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const data: CreateOrganizationInput = req.body;
      const result = await organizationService.create(userId, data);
      return sendCreated(res, result, ApiMessages.RESOURCE_CREATED);
    } catch (err) {
      next(err);
    }
  },

  async listMine(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const result = await organizationService.listMine(userId);
      return sendSuccess(res, result, ApiMessages.RESOURCE_FETCHED);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const organizationId = String(req.params.organizationId);
      const result = await organizationService.getById(
        userId,
        organizationId,
      );
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const organizationId = String(req.params.organizationId);
      const data: UpdateOrganizationInput = req.body;
      const { organization, message } = await organizationService.update(
        userId,
        organizationId,
        data,
      );
      return sendSuccess(res, organization, message);
    } catch (err) {
      next(err);
    }
  },

  async uploadLogo(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new BadRequestError('Logo file is required (field name: "logo")');
      }

      const userId = req.user!.userId;
      const organizationId = String(req.params.organizationId);
      const result = await organizationService.uploadLogo(
        userId,
        organizationId,
        req.file.filename,
      );
      return sendSuccess(res, result, result.message);
    } catch (err) {
      next(err);
    }
  },

  async listMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const organizationId = String(req.params.organizationId);
      const result = await organizationService.listMembers(
        userId,
        organizationId,
      );
      return sendSuccess(res, result, ApiMessages.RESOURCE_FETCHED);
    } catch (err) {
      next(err);
    }
  },

  async inviteMember(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const organizationId = String(req.params.organizationId);
      const data: InviteMemberInput = req.body;
      const result = await organizationService.inviteMember(
        userId,
        organizationId,
        data,
      );
      return sendCreated(res, result, ApiMessages.RESOURCE_CREATED);
    } catch (err) {
      next(err);
    }
  },

  async updateMemberRole(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const organizationId = String(req.params.organizationId);
      const memberId = String(req.params.memberId);
      const data: UpdateMemberRoleInput = req.body;
      const { member, message } = await organizationService.updateMemberRole(
        userId,
        organizationId,
        memberId,
        data,
      );
      return sendSuccess(res, member, message);
    } catch (err) {
      next(err);
    }
  },
};
