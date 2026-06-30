import mongoose from "mongoose";
import { JobPostingStatus } from "../../../common/enums/jobPostingStatus.enum.js";
import { ShiftDateStatus } from "../../../common/enums/shiftDateStatus.enum.js";
import { ApiMessages } from "../../../constants/index.js";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../../../utils/errors.js";
import { Position } from "./position/position.model.js";
import {
  Job,
  JobPosting,
  type IJobPosting,
  JobShiftDate,
  JobShiftSlot,
  JobShiftTemplate,
  type IJob,
} from "./model/index.js";
import type {
  AddJobsInput,
  AssignSlotInput,
  CreateJobPostingInput,
  CreateShiftTemplateInput,
  GenerateShiftDatesInput,
  UpdateJobPostingInput,
  UpdateShiftDateInput,
} from "./job-posting.schema.js";
import {
  assignWorkerToSlot,
  generateSlotsForShiftDate,
} from "./shift-slot.service.js";
import { eachUtcDayInRange, startOfUtcDay } from "./utils/shift-dates.util.js";

function mapLocationInput(
  location?: CreateJobPostingInput["location"],
): IJobPosting["location"] {
  if (!location) return {};
  return {
    ...(location.provinceId
      ? { provinceId: new mongoose.Types.ObjectId(location.provinceId) }
      : {}),
    ...(location.districtId
      ? { districtId: new mongoose.Types.ObjectId(location.districtId) }
      : {}),
    ...(location.wardId
      ? { wardId: new mongoose.Types.ObjectId(location.wardId) }
      : {}),
    ...(location.address !== undefined ? { address: location.address } : {}),
  };
}

async function getPostingForOrg(organizationId: string, postingId: string) {
  const posting = await JobPosting.findOne({
    _id: postingId,
    organizationId,
  });

  if (!posting) {
    throw new NotFoundError("Job posting not found");
  }

  return posting;
}

function assertDraft(posting: { status: JobPostingStatus }) {
  if (posting.status !== JobPostingStatus.DRAFT) {
    throw new BadRequestError("Only draft postings can be modified");
  }
}

export class JobPostingService {
  async create(organizationId: string, posterId: string, data: CreateJobPostingInput) {
    const posting = await JobPosting.create({
      organizationId,
      posterId,
      title: data.title,
      ...(data.description !== undefined ? { description: data.description } : {}),
      location: mapLocationInput(data.location),
      ...(data.requirements !== undefined
        ? { requirements: data.requirements }
        : {}),
      ...(data.benefits !== undefined ? { benefits: data.benefits } : {}),
      ...(data.deadline !== undefined ? { deadline: data.deadline } : {}),
      status: JobPostingStatus.DRAFT,
    });

    return this.formatPosting(posting);
  }

  async list(organizationId: string, status?: JobPostingStatus) {
    const filter: Record<string, unknown> = { organizationId };
    if (status) filter.status = status;

    const postings = await JobPosting.find(filter).sort({ updatedAt: -1 });
    return Promise.all(postings.map((p) => this.formatPostingSummary(p)));
  }

  async getDetail(organizationId: string, postingId: string) {
    const posting = await getPostingForOrg(organizationId, postingId);
    const jobs = await Job.find({ jobPostingId: posting._id, isActive: true })
      .populate("positionId", "code name")
      .sort({ sortOrder: 1 });

    const jobIds = jobs.map((j) => j._id);
    const templates = await JobShiftTemplate.find({
      jobId: { $in: jobIds },
      isActive: true,
    });

    return {
      ...this.formatPosting(posting),
      jobs: jobs.map((j) => this.formatJob(j)),
      shiftTemplates: templates.map((t) => this.formatTemplate(t)),
    };
  }

  async update(
    organizationId: string,
    postingId: string,
    data: UpdateJobPostingInput,
  ) {
    const posting = await getPostingForOrg(organizationId, postingId);
    assertDraft(posting);

    if (data.title !== undefined) posting.title = data.title;
    if (data.description !== undefined) posting.description = data.description;
    if (data.location !== undefined) {
      posting.location = mapLocationInput(data.location);
    }
    if (data.requirements !== undefined) posting.requirements = data.requirements;
    if (data.benefits !== undefined) posting.benefits = data.benefits;
    if (data.deadline !== undefined) posting.deadline = data.deadline;

    await posting.save();
    return {
      posting: this.formatPosting(posting),
      message: ApiMessages.RESOURCE_UPDATED,
    };
  }

  async publish(organizationId: string, postingId: string) {
    const posting = await getPostingForOrg(organizationId, postingId);
    if (posting.status !== JobPostingStatus.DRAFT) {
      throw new BadRequestError("Only draft postings can be published");
    }

    const jobCount = await Job.countDocuments({
      jobPostingId: posting._id,
      isActive: true,
    });
    if (jobCount === 0) {
      throw new BadRequestError(
        "Add at least one job (e.g. Phục vụ, Thu ngân) before publishing",
      );
    }

    posting.status = JobPostingStatus.PUBLISHED;
    posting.publishedAt = new Date();
    await posting.save();

    return {
      posting: this.formatPosting(posting),
      message: "Job posting published",
    };
  }

  async close(organizationId: string, postingId: string) {
    const posting = await getPostingForOrg(organizationId, postingId);
    if (posting.status !== JobPostingStatus.PUBLISHED) {
      throw new BadRequestError("Only published postings can be closed");
    }

    posting.status = JobPostingStatus.CLOSED;
    posting.closedAt = new Date();
    await posting.save();

    await JobShiftDate.updateMany(
      { jobPostingId: posting._id, isOpen: true },
      {
        $set: {
          isOpen: false,
          status: ShiftDateStatus.CLOSED,
        },
      },
    );

    return {
      posting: this.formatPosting(posting),
      message: "Job posting closed",
    };
  }

  async delete(organizationId: string, postingId: string) {
    const posting = await getPostingForOrg(organizationId, postingId);

    if (posting.status === JobPostingStatus.PUBLISHED) {
      throw new BadRequestError("Close the posting before delete, or use close");
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await JobShiftSlot.deleteMany({ jobPostingId: posting._id }).session(
        session,
      );
      await JobShiftDate.deleteMany({ jobPostingId: posting._id }).session(
        session,
      );
      await JobShiftTemplate.deleteMany({ jobPostingId: posting._id }).session(
        session,
      );
      await Job.deleteMany({ jobPostingId: posting._id }).session(session);
      await JobPosting.deleteOne({ _id: posting._id }).session(session);

      await session.commitTransaction();
      return { message: ApiMessages.RESOURCE_DELETED };
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  async addJobs(
    organizationId: string,
    postingId: string,
    data: AddJobsInput,
  ) {
    const posting = await getPostingForOrg(organizationId, postingId);
    assertDraft(posting);

    const positionIds = [...new Set(data.jobs.map((j) => j.positionId))];
    const found = await Position.countDocuments({
      _id: { $in: positionIds },
      isActive: { $ne: false },
    });
    if (found !== positionIds.length) {
      throw new BadRequestError("One or more positions are invalid");
    }

    const created = await Job.insertMany(
      data.jobs.map((j, index) => ({
        jobPostingId: posting._id,
        positionId: j.positionId,
        title: j.title,
        description: j.description,
        sortOrder: j.sortOrder ?? index,
      })),
    );

    return created.map((j) => this.formatJob(j as unknown as IJob));
  }

  async createShiftTemplate(
    organizationId: string,
    postingId: string,
    jobId: string,
    data: CreateShiftTemplateInput,
  ) {
    const posting = await getPostingForOrg(organizationId, postingId);
    assertDraft(posting);

    const job = await Job.findOne({ _id: jobId, jobPostingId: posting._id });
    if (!job) {
      throw new NotFoundError("Job not found in this posting");
    }

    const template = await JobShiftTemplate.create({
      jobId: job._id,
      jobPostingId: posting._id,
      ...(data.name !== undefined ? { name: data.name } : {}),
      weekdays: data.weekdays,
      startTime: data.startTime,
      endTime: data.endTime,
      salary: data.salary,
      slotsPerShift: data.slotsPerShift,
      genderRequirement: data.genderRequirement,
      effectiveFrom: startOfUtcDay(data.effectiveFrom),
      effectiveTo: startOfUtcDay(data.effectiveTo),
    });

    return this.formatTemplate(template);
  }

  async generateShiftDates(
    organizationId: string,
    postingId: string,
    jobId: string,
    templateId: string,
    options: GenerateShiftDatesInput = { autoGenerateSlots: false },
  ) {
    const posting = await getPostingForOrg(organizationId, postingId);
    assertDraft(posting);

    const template = await JobShiftTemplate.findOne({
      _id: templateId,
      jobId,
      jobPostingId: posting._id,
      isActive: true,
    });
    if (!template) {
      throw new NotFoundError("Shift template not found");
    }

    const from = startOfUtcDay(options.from ?? template.effectiveFrom);
    const to = startOfUtcDay(options.to ?? template.effectiveTo);
    const days = eachUtcDayInRange(from, to, template.weekdays);

    let created = 0;
    let updated = 0;

    for (const day of days) {
      const existing = await JobShiftDate.findOne({
        jobShiftTemplateId: template._id,
        date: day,
      });

      if (existing) {
        existing.startTime = template.startTime;
        existing.endTime = template.endTime;
        existing.totalSlots = template.slotsPerShift;
        existing.salary = template.salary;
        existing.genderRequirement = template.genderRequirement;
        existing.isOpen = true;
        existing.status = ShiftDateStatus.OPEN;
        await existing.save();
        updated += 1;
      } else {
        await JobShiftDate.create({
          jobShiftTemplateId: template._id,
          jobId: template.jobId,
          jobPostingId: template.jobPostingId,
          date: day,
          startTime: template.startTime,
          endTime: template.endTime,
          totalSlots: template.slotsPerShift,
          salary: template.salary,
          genderRequirement: template.genderRequirement,
          isOpen: true,
          status: ShiftDateStatus.OPEN,
        });
        created += 1;
      }
    }

    if (options.autoGenerateSlots) {
      const allDates = await JobShiftDate.find({
        jobShiftTemplateId: template._id,
        date: { $gte: from, $lte: to },
      });
      for (const sd of allDates) {
        await generateSlotsForShiftDate(sd._id.toString());
      }
    }

    return {
      generated: days.length,
      created,
      updated,
      autoGenerateSlots: options.autoGenerateSlots,
    };
  }

  async listShiftDates(
    organizationId: string,
    postingId: string,
    jobId: string,
    templateId: string,
  ) {
    await getPostingForOrg(organizationId, postingId);

    const dates = await JobShiftDate.find({
      jobShiftTemplateId: templateId,
      jobId,
    }).sort({ date: 1 });

    return dates.map((d) => this.formatShiftDate(d));
  }

  async openShiftDate(
    organizationId: string,
    postingId: string,
    shiftDateId: string,
  ) {
    const posting = await getPostingForOrg(organizationId, postingId);
    if (posting.status === JobPostingStatus.CLOSED) {
      throw new BadRequestError("Posting is closed");
    }

    const date = await JobShiftDate.findOne({
      _id: shiftDateId,
      jobPostingId: posting._id,
    });
    if (!date) {
      throw new NotFoundError("Shift date not found");
    }

    date.isOpen = true;
    date.status =
      date.assignedCount + date.reservedCount >= date.totalSlots
        ? ShiftDateStatus.FULL
        : ShiftDateStatus.OPEN;
    await date.save();

    return this.formatShiftDate(date);
  }

  async closeShiftDate(
    organizationId: string,
    postingId: string,
    shiftDateId: string,
  ) {
    const posting = await getPostingForOrg(organizationId, postingId);
    const date = await JobShiftDate.findOne({
      _id: shiftDateId,
      jobPostingId: posting._id,
    });
    if (!date) {
      throw new NotFoundError("Shift date not found");
    }

    date.isOpen = false;
    date.status = ShiftDateStatus.CLOSED;
    await date.save();

    return this.formatShiftDate(date);
  }

  async updateShiftDate(
    organizationId: string,
    postingId: string,
    shiftDateId: string,
    data: UpdateShiftDateInput,
  ) {
    const posting = await getPostingForOrg(organizationId, postingId);
    assertDraft(posting);

    const date = await JobShiftDate.findOne({
      _id: shiftDateId,
      jobPostingId: posting._id,
    });
    if (!date) {
      throw new NotFoundError("Shift date not found");
    }

    if (data.totalSlots !== undefined) {
      const activeSlots = await JobShiftSlot.countDocuments({
        shiftDateId: date._id,
        status: { $in: ["AVAILABLE", "RESERVED", "ASSIGNED"] },
      });
      if (data.totalSlots < activeSlots) {
        throw new ConflictError(
          `Cannot set totalSlots below existing active slots (${activeSlots})`,
        );
      }
      date.totalSlots = data.totalSlots;
    }
    if (data.salary !== undefined) date.salary = data.salary;
    if (data.genderRequirement !== undefined) {
      date.genderRequirement = data.genderRequirement;
    }

    await date.save();
    return this.formatShiftDate(date);
  }

  async generateSlots(
    organizationId: string,
    postingId: string,
    shiftDateId: string,
  ) {
    await getPostingForOrg(organizationId, postingId);
    return generateSlotsForShiftDate(shiftDateId);
  }

  async listSlots(
    organizationId: string,
    postingId: string,
    shiftDateId: string,
  ) {
    await getPostingForOrg(organizationId, postingId);

    const slots = await JobShiftSlot.find({ shiftDateId }).sort({
      slotNumber: 1,
    });
    return slots.map((s) => this.formatSlot(s));
  }

  async assignSlot(
    organizationId: string,
    postingId: string,
    shiftDateId: string,
    slotId: string,
    assignedBy: string,
    data: AssignSlotInput,
  ) {
    await getPostingForOrg(organizationId, postingId);

    const slot = await JobShiftSlot.findOne({
      _id: slotId,
      shiftDateId,
      jobPostingId: postingId,
    });
    if (!slot) {
      throw new NotFoundError("Slot not found");
    }

    const updated = await assignWorkerToSlot({
      slotId,
      workerId: data.workerId,
      assignedBy,
      ...(data.expectedVersion !== undefined
        ? { expectedVersion: data.expectedVersion }
        : {}),
    });

    return this.formatSlot(updated);
  }

  private formatPosting(posting: InstanceType<typeof JobPosting>) {
    return {
      id: posting._id.toString(),
      organizationId: posting.organizationId.toString(),
      posterId: posting.posterId.toString(),
      title: posting.title,
      description: posting.description ?? null,
      location: posting.location,
      requirements: posting.requirements ?? null,
      benefits: posting.benefits ?? null,
      deadline: posting.deadline ?? null,
      status: posting.status,
      publishedAt: posting.publishedAt ?? null,
      closedAt: posting.closedAt ?? null,
      viewCount: posting.viewCount,
      applicationCount: posting.applicationCount,
      createdAt: posting.createdAt,
      updatedAt: posting.updatedAt,
    };
  }

  private formatPostingSummary(posting: InstanceType<typeof JobPosting>) {
    return {
      id: posting._id.toString(),
      title: posting.title,
      status: posting.status,
      publishedAt: posting.publishedAt ?? null,
      updatedAt: posting.updatedAt,
    };
  }

  private formatJob(job: IJob) {
    const pos = job.positionId as unknown as {
      _id?: mongoose.Types.ObjectId;
      code?: string;
      name?: string;
    };

    return {
      id: job._id.toString(),
      jobPostingId: job.jobPostingId.toString(),
      positionId: job.positionId.toString(),
      position:
        pos && typeof pos === "object" && "code" in pos
          ? { id: pos._id?.toString(), code: pos.code, name: pos.name }
          : null,
      title: job.title,
      description: job.description ?? null,
      sortOrder: job.sortOrder,
      isActive: job.isActive,
    };
  }

  private formatTemplate(t: InstanceType<typeof JobShiftTemplate>) {
    return {
      id: t._id.toString(),
      jobId: t.jobId.toString(),
      name: t.name ?? null,
      weekdays: t.weekdays,
      startTime: t.startTime,
      endTime: t.endTime,
      salary: t.salary,
      slotsPerShift: t.slotsPerShift,
      genderRequirement: t.genderRequirement,
      effectiveFrom: t.effectiveFrom,
      effectiveTo: t.effectiveTo,
      isActive: t.isActive,
    };
  }

  private formatShiftDate(d: InstanceType<typeof JobShiftDate>) {
    return {
      id: d._id.toString(),
      jobShiftTemplateId: d.jobShiftTemplateId.toString(),
      jobId: d.jobId.toString(),
      date: d.date,
      startTime: d.startTime,
      endTime: d.endTime,
      totalSlots: d.totalSlots,
      assignedCount: d.assignedCount,
      reservedCount: d.reservedCount,
      salary: d.salary,
      genderRequirement: d.genderRequirement,
      status: d.status,
      isOpen: d.isOpen,
    };
  }

  private formatSlot(s: InstanceType<typeof JobShiftSlot>) {
    return {
      id: s._id.toString(),
      shiftDateId: s.shiftDateId.toString(),
      slotNumber: s.slotNumber,
      status: s.status,
      workerId: s.workerId?.toString() ?? null,
      assignedAt: s.assignedAt ?? null,
      version: s.version,
    };
  }
}

export const jobPostingService = new JobPostingService();
