import { z } from "zod";
import { objectIdSchema } from "../../../common/schemas/objectId.schema.js";
import { Gender } from "../../../common/enums/gender.enum.js";
import { JobPostingStatus } from "../../../common/enums/jobPostingStatus.enum.js";

const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be HH:mm");

const locationSchema = z.object({
  provinceId: objectIdSchema.optional(),
  districtId: objectIdSchema.optional(),
  wardId: objectIdSchema.optional(),
  address: z.string().trim().max(500).optional(),
});

export const orgIdParamSchema = z.object({
  params: z.object({ organizationId: objectIdSchema }),
});

export const postingIdParamSchema = z.object({
  params: z.object({
    organizationId: objectIdSchema,
    postingId: objectIdSchema,
  }),
});

export const jobIdParamSchema = z.object({
  params: z.object({
    organizationId: objectIdSchema,
    postingId: objectIdSchema,
    jobId: objectIdSchema,
  }),
});

export const templateIdParamSchema = z.object({
  params: z.object({
    organizationId: objectIdSchema,
    postingId: objectIdSchema,
    jobId: objectIdSchema,
    templateId: objectIdSchema,
  }),
});

export const shiftDateIdParamSchema = z.object({
  params: z.object({
    organizationId: objectIdSchema,
    postingId: objectIdSchema,
    jobId: objectIdSchema,
    templateId: objectIdSchema,
    shiftDateId: objectIdSchema,
  }),
});

export const postingShiftDateParamSchema = z.object({
  params: z.object({
    organizationId: objectIdSchema,
    postingId: objectIdSchema,
    shiftDateId: objectIdSchema,
  }),
});

export const postingSlotParamSchema = z.object({
  params: z.object({
    organizationId: objectIdSchema,
    postingId: objectIdSchema,
    shiftDateId: objectIdSchema,
    slotId: objectIdSchema,
  }),
});

export const slotIdParamSchema = z.object({
  params: z.object({
    organizationId: objectIdSchema,
    postingId: objectIdSchema,
    jobId: objectIdSchema,
    templateId: objectIdSchema,
    shiftDateId: objectIdSchema,
    slotId: objectIdSchema,
  }),
});

export const createJobPostingSchema = z.object({
  params: z.object({ organizationId: objectIdSchema }),
  body: z.object({
    title: z.string().trim().min(3).max(200),
    description: z.string().trim().max(10000).optional(),
    location: locationSchema.optional(),
    requirements: z.string().trim().max(5000).optional(),
    benefits: z.string().trim().max(5000).optional(),
    deadline: z.coerce.date().optional(),
  }),
});

export const updateJobPostingSchema = z.object({
  params: z.object({
    organizationId: objectIdSchema,
    postingId: objectIdSchema,
  }),
  body: createJobPostingSchema.shape.body
    .partial()
    .refine((d) => Object.keys(d).length > 0, {
      message: "At least one field required",
    }),
});

export const addJobsSchema = z.object({
  params: z.object({
    organizationId: objectIdSchema,
    postingId: objectIdSchema,
  }),
  body: z.object({
    jobs: z
      .array(
        z.object({
          positionId: objectIdSchema,
          title: z.string().trim().min(1).max(120),
          description: z.string().trim().max(2000).optional(),
          sortOrder: z.number().int().min(0).optional(),
        }),
      )
      .min(1)
      .max(20),
  }),
});

export const createShiftTemplateSchema = z.object({
  params: z.object({
    organizationId: objectIdSchema,
    postingId: objectIdSchema,
    jobId: objectIdSchema,
  }),
  body: z
    .object({
      name: z.string().trim().max(100).optional(),
      weekdays: z.array(z.number().int().min(0).max(6)).min(1),
      startTime: timeSchema,
      endTime: timeSchema,
      salary: z.number().min(0),
      slotsPerShift: z.number().int().min(1).max(500).default(1),
      genderRequirement: z.nativeEnum(Gender).default(Gender.ANY),
      effectiveFrom: z.coerce.date(),
      effectiveTo: z.coerce.date(),
    })
    .refine((d) => d.startTime < d.endTime, {
      message: "startTime must be before endTime",
      path: ["endTime"],
    })
    .refine((d) => d.effectiveFrom <= d.effectiveTo, {
      message: "effectiveFrom must be before effectiveTo",
      path: ["effectiveTo"],
    }),
});

export const generateShiftDatesSchema = z.object({
  params: z.object({
    organizationId: objectIdSchema,
    postingId: objectIdSchema,
    jobId: objectIdSchema,
    templateId: objectIdSchema,
  }),
  body: z
    .object({
      from: z.coerce.date().optional(),
      to: z.coerce.date().optional(),
      autoGenerateSlots: z.boolean().default(false),
    })
    .optional()
    .default({ autoGenerateSlots: false }),
});

export const updateShiftDateSchema = z.object({
  params: postingShiftDateParamSchema.shape.params,
  body: z
    .object({
      totalSlots: z.number().int().min(1).max(500).optional(),
      salary: z.number().min(0).optional(),
      genderRequirement: z.nativeEnum(Gender).optional(),
    })
    .refine((d) => Object.keys(d).length > 0, {
      message: "At least one field required",
    }),
});

export const assignSlotSchema = z.object({
  params: postingSlotParamSchema.shape.params,
  body: z.object({
    workerId: objectIdSchema,
    expectedVersion: z.number().int().min(0).optional(),
  }),
});

export type CreateJobPostingInput = z.infer<
  typeof createJobPostingSchema
>["body"];
export type UpdateJobPostingInput = z.infer<
  typeof updateJobPostingSchema
>["body"];
export type AddJobsInput = z.infer<typeof addJobsSchema>["body"];
export type CreateShiftTemplateInput = z.infer<
  typeof createShiftTemplateSchema
>["body"];
export type GenerateShiftDatesInput = z.infer<
  typeof generateShiftDatesSchema
>["body"];
export type UpdateShiftDateInput = z.infer<
  typeof updateShiftDateSchema
>["body"];
export type AssignSlotInput = z.infer<typeof assignSlotSchema>["body"];
