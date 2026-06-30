import type { Request, Response, NextFunction } from "express";
import { ApiMessages } from "../../../constants/index.js";
import {
  sendCreated,
  sendSuccess,
} from "../../../common/response/response.util.js";
import { jobPostingService } from "./job-posting.service.js";
import type {
  AddJobsInput,
  AssignSlotInput,
  CreateJobPostingInput,
  CreateShiftTemplateInput,
  GenerateShiftDatesInput,
  UpdateJobPostingInput,
  UpdateShiftDateInput,
} from "./job-posting.schema.js";

const orgId = (req: Request) => String(req.params.organizationId);
const postingId = (req: Request) => String(req.params.postingId);
const jobId = (req: Request) => String(req.params.jobId);
const templateId = (req: Request) => String(req.params.templateId);
const shiftDateId = (req: Request) => String(req.params.shiftDateId);
const slotId = (req: Request) => String(req.params.slotId);

export const JobPostingController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data: CreateJobPostingInput = req.body;
      const result = await jobPostingService.create(
        orgId(req),
        req.user!.userId,
        data,
      );
      return sendCreated(res, result, ApiMessages.RESOURCE_CREATED);
    } catch (err) {
      next(err);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const status = req.query.status as string | undefined;
      const result = await jobPostingService.list(orgId(req), status as never);
      return sendSuccess(res, result, ApiMessages.RESOURCE_FETCHED);
    } catch (err) {
      next(err);
    }
  },

  async getDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await jobPostingService.getDetail(
        orgId(req),
        postingId(req),
      );
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data: UpdateJobPostingInput = req.body;
      const { posting, message } = await jobPostingService.update(
        orgId(req),
        postingId(req),
        data,
      );
      return sendSuccess(res, posting, message);
    } catch (err) {
      next(err);
    }
  },

  async publish(req: Request, res: Response, next: NextFunction) {
    try {
      const { posting, message } = await jobPostingService.publish(
        orgId(req),
        postingId(req),
      );
      return sendSuccess(res, posting, message);
    } catch (err) {
      next(err);
    }
  },

  async close(req: Request, res: Response, next: NextFunction) {
    try {
      const { posting, message } = await jobPostingService.close(
        orgId(req),
        postingId(req),
      );
      return sendSuccess(res, posting, message);
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { message } = await jobPostingService.delete(
        orgId(req),
        postingId(req),
      );
      return sendSuccess(res, null, message);
    } catch (err) {
      next(err);
    }
  },

  async addJobs(req: Request, res: Response, next: NextFunction) {
    try {
      const data: AddJobsInput = req.body;
      const result = await jobPostingService.addJobs(
        orgId(req),
        postingId(req),
        data,
      );
      return sendCreated(res, result, ApiMessages.RESOURCE_CREATED);
    } catch (err) {
      next(err);
    }
  },

  async createShiftTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const data: CreateShiftTemplateInput = req.body;
      const result = await jobPostingService.createShiftTemplate(
        orgId(req),
        postingId(req),
        jobId(req),
        data,
      );
      return sendCreated(res, result, ApiMessages.RESOURCE_CREATED);
    } catch (err) {
      next(err);
    }
  },

  async generateShiftDates(req: Request, res: Response, next: NextFunction) {
    try {
      const data: GenerateShiftDatesInput = req.body ?? {
        autoGenerateSlots: false,
      };
      const result = await jobPostingService.generateShiftDates(
        orgId(req),
        postingId(req),
        jobId(req),
        templateId(req),
        data,
      );
      return sendSuccess(res, result, ApiMessages.RESOURCE_CREATED);
    } catch (err) {
      next(err);
    }
  },

  async listShiftDates(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await jobPostingService.listShiftDates(
        orgId(req),
        postingId(req),
        jobId(req),
        templateId(req),
      );
      return sendSuccess(res, result, ApiMessages.RESOURCE_FETCHED);
    } catch (err) {
      next(err);
    }
  },

  async openShiftDate(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await jobPostingService.openShiftDate(
        orgId(req),
        postingId(req),
        shiftDateId(req),
      );
      return sendSuccess(res, result, ApiMessages.RESOURCE_UPDATED);
    } catch (err) {
      next(err);
    }
  },

  async closeShiftDate(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await jobPostingService.closeShiftDate(
        orgId(req),
        postingId(req),
        shiftDateId(req),
      );
      return sendSuccess(res, result, ApiMessages.RESOURCE_UPDATED);
    } catch (err) {
      next(err);
    }
  },

  async updateShiftDate(req: Request, res: Response, next: NextFunction) {
    try {
      const data: UpdateShiftDateInput = req.body;
      const result = await jobPostingService.updateShiftDate(
        orgId(req),
        postingId(req),
        shiftDateId(req),
        data,
      );
      return sendSuccess(res, result, ApiMessages.RESOURCE_UPDATED);
    } catch (err) {
      next(err);
    }
  },

  async generateSlots(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await jobPostingService.generateSlots(
        orgId(req),
        postingId(req),
        shiftDateId(req),
      );
      return sendSuccess(res, result, ApiMessages.RESOURCE_CREATED);
    } catch (err) {
      next(err);
    }
  },

  async listSlots(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await jobPostingService.listSlots(
        orgId(req),
        postingId(req),
        shiftDateId(req),
      );
      return sendSuccess(res, result, ApiMessages.RESOURCE_FETCHED);
    } catch (err) {
      next(err);
    }
  },

  async assignSlot(req: Request, res: Response, next: NextFunction) {
    try {
      const data: AssignSlotInput = req.body;
      const result = await jobPostingService.assignSlot(
        orgId(req),
        postingId(req),
        shiftDateId(req),
        slotId(req),
        req.user!.userId,
        data,
      );
      return sendSuccess(res, result, ApiMessages.RESOURCE_UPDATED);
    } catch (err) {
      next(err);
    }
  },
};
