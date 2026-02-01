import { z } from "zod";

export const createOrganizationSchema = z.object({
  body: z.object({
    ownerId: z
      .string({ message: "Owner ID is required" })
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId"),

    name: z
      .string({ message: "Organization name is required" })
      .min(2, "Organization name must be at least 2 characters")
      .trim(),
    slug: z
      .string({ message: "Slug is required" })
      .min(2, "Slug must be at least 2 characters")
      .trim()
      .lowercase()
      .optional(),
    description: z.string().optional(),
    logo: z.string().url("Logo must be a valid URL").optional(),
    coverImage: z.string().url("Cover image must be a valid URL").optional(),

    organizationType: z
      .string({ message: "Organization type is required" })
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId"),
    address: z.string({ message: "" }),
  }),
});
