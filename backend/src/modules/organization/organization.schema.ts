import { z } from "zod";
import { objectIdSchema } from "../../common/schemas/objectId.schema.js";
import { OrganizationMemberRole } from "../../common/enums/organizationMemberRole.enum.js";
import { OrganizationLevel } from "./organization.model.js";

const socialLinkSchema = z.object({
  platform: z.enum(["FACEBOOK", "ZALO", "LINKEDIN"]),
  url: z.string().url("Invalid social link URL"),
});

const coordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

const organizationFieldsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Organization name must be at least 2 characters")
    .max(200),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format")
    .optional(),
  description: z.string().trim().max(5000).optional(),
  organizationType: objectIdSchema,
  address: z.string().trim().min(5, "Address is required").max(500),
  provinceId: objectIdSchema,
  districtId: objectIdSchema,
  wardId: objectIdSchema,
  coordinates: coordinatesSchema.optional(),
  contactPhone: z
    .string()
    .trim()
    .regex(/^(0|\+84)[0-9]{9,10}$/, "Invalid Vietnamese phone number"),
  email: z.string().trim().email("Invalid email"),
  website: z.string().url().optional(),
  socialLinks: z.array(socialLinkSchema).max(5).optional(),
  taxCode: z.string().trim().max(20).optional(),
  verificationLevel: z
    .union([
      z.literal(OrganizationLevel.LEVEL_1),
      z.literal(OrganizationLevel.LEVEL_2),
    ])
    .optional(),
});

export const createOrganizationSchema = z.object({
  body: organizationFieldsSchema,
});

export const updateOrganizationSchema = z.object({
  params: z.object({
    organizationId: objectIdSchema,
  }),
  body: organizationFieldsSchema
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided",
    }),
});

export const organizationIdParamSchema = z.object({
  params: z.object({
    organizationId: objectIdSchema,
  }),
});

export const inviteMemberSchema = z.object({
  params: z.object({
    organizationId: objectIdSchema,
  }),
  body: z.object({
    email: z.string().trim().email("Invalid email"),
    role: z.enum([
      OrganizationMemberRole.ADMIN,
      OrganizationMemberRole.STAFF,
      OrganizationMemberRole.RECRUITER,
    ]),
  }),
});

export const updateMemberRoleSchema = z.object({
  params: z.object({
    organizationId: objectIdSchema,
    memberId: objectIdSchema,
  }),
  body: z.object({
    role: z.enum([
      OrganizationMemberRole.ADMIN,
      OrganizationMemberRole.STAFF,
      OrganizationMemberRole.RECRUITER,
    ]),
  }),
});

export type CreateOrganizationInput = z.infer<
  typeof createOrganizationSchema
>["body"];
export type UpdateOrganizationInput = z.infer<
  typeof updateOrganizationSchema
>["body"];
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>["body"];
export type UpdateMemberRoleInput = z.infer<
  typeof updateMemberRoleSchema
>["body"];
