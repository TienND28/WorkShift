import { z } from "zod";

export const createIndustrySchema = z.object({
  body: z.object({
    code: z
      .string({
        message: "Industry code is required",
      })
      .min(2, "Industry code must be at least 2 characters"),
    name: z
      .string({
        message: "Industry name is required",
      })
      .min(2, "Industry name must be at least 2 characters"),
  }),
});

export const updateIndustrySchema = z.object({
  params: z.object({
    id: z
      .string({
        message: "Industry ID is required",
      })
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId"),
  }),
  body: z.object({
    name: z
      .string()
      .min(2, "Industry name must be at least 2 characters")
      .optional(),
    isActive: z.boolean().optional(),
  }),
});

export type CreateIndustryInput = z.infer<typeof createIndustrySchema>["body"];
export type UpdateIndustryInput = z.infer<typeof updateIndustrySchema>["body"];
