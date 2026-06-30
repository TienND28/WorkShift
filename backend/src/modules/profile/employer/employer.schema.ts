import { z } from "zod";
import { RecruiterTitle } from "../../../common/enums/recruiterTitle.enum.js";
import { objectIdSchema } from "../../../common/schemas/objectId.schema.js";

const coordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const updateEmployerProfileSchema = z.object({
  body: z.object({
    businessName: z.string().trim().min(1).max(200),
    organizationType: objectIdSchema,
    taxCode: z.string().trim().max(20).optional(),
    recruiterName: z.string().trim().min(1).max(120),
    recruiterTitle: z.nativeEnum(RecruiterTitle).optional(),
    recruiterTitleOther: z.string().trim().max(80).optional(),
    address: z.string().trim().min(1).max(500),
    provinceId: objectIdSchema,
    districtId: objectIdSchema,
    wardId: objectIdSchema,
    coordinates: coordinatesSchema,
    contactPhone: z.string().trim().min(8).max(20),
    contactEmail: z.string().trim().email().max(254),
  }),
});

export const sendEmployerEmailOtpSchema = z.object({
  body: z.object({
    email: z.string().trim().email().max(254),
  }),
});

export const verifyEmployerEmailOtpSchema = z.object({
  body: z.object({
    email: z.string().trim().email().max(254),
    otp: z
      .string()
      .trim()
      .regex(/^\d{6}$/, "OTP must be 6 digits"),
  }),
});

export const createEmployerProfileSchema = z.object({
  body: z.object({}).optional().default({}),
});

export type UpdateEmployerProfileInput = z.infer<
  typeof updateEmployerProfileSchema
>["body"];

export type SendEmployerEmailOtpInput = z.infer<
  typeof sendEmployerEmailOtpSchema
>["body"];

export type VerifyEmployerEmailOtpInput = z.infer<
  typeof verifyEmployerEmailOtpSchema
>["body"];
