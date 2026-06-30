import { z } from "zod";

import type { WorkerProfileLimits } from "../../../config/workerProfileLimits.js";

import { getWorkerProfileLimits } from "../../../config/workerProfileLimits.js";

import { WorkerMembershipTier } from "../../../common/enums/workerMembershipTier.enum.js";



const objectIdSchema = z

  .string()

  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");



const timeSchema = z

  .string()

  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be in HH:mm format");



export const workerAvailabilitySchema = z

  .object({

    weekday: z

      .number()

      .int("Weekday must be an integer")

      .min(0, "Weekday must be 0 (Sunday) to 6 (Saturday)")

      .max(6, "Weekday must be 0 (Sunday) to 6 (Saturday)"),

    startTime: timeSchema,

    endTime: timeSchema,

  })

  .refine((slot) => slot.startTime < slot.endTime, {

    message: "startTime must be before endTime",

    path: ["endTime"],

  });



export function createWorkerProfileFieldsSchema(limits: WorkerProfileLimits) {

  return z.object({

    bio: z.string().trim().max(2000, "Bio must be at most 2000 characters").optional(),

    expectedSalary: z

      .number()

      .min(0, "Expected salary must be non-negative")

      .optional(),

    preferredIndustryIds: z

      .array(objectIdSchema)

      .max(limits.preferredIndustries)

      .optional(),

    preferredPositionIds: z

      .array(objectIdSchema)

      .max(limits.preferredPositions)

      .optional(),

    preferredDistrictIds: z

      .array(objectIdSchema)

      .max(limits.preferredDistricts)

      .optional(),

    availabilities: z

      .array(workerAvailabilitySchema)

      .max(limits.availabilities)

      .optional(),

  });

}



export function createWorkerProfileSchemaForTier(

  tier: WorkerMembershipTier = WorkerMembershipTier.FREE,

) {

  const limits = getWorkerProfileLimits(tier);

  return z.object({

    body: createWorkerProfileFieldsSchema(limits).optional().default({}),

  });

}



export function updateWorkerProfileSchemaForTier(

  tier: WorkerMembershipTier = WorkerMembershipTier.FREE,

) {

  const limits = getWorkerProfileLimits(tier);

  return z.object({

    body: createWorkerProfileFieldsSchema(limits).refine(

      (data) => Object.keys(data).length > 0,

      { message: "At least one field must be provided" },

    ),

  });

}



/** Mặc định FREE — route nên dùng middleware theo tier user. */

export const createWorkerProfileSchema = createWorkerProfileSchemaForTier();

export const updateWorkerProfileSchema = updateWorkerProfileSchemaForTier();



export type WorkerAvailabilityInput = z.infer<typeof workerAvailabilitySchema>;

export type CreateWorkerProfileInput = z.infer<

  ReturnType<typeof createWorkerProfileFieldsSchema>

>;

export type UpdateWorkerProfileInput = CreateWorkerProfileInput;

