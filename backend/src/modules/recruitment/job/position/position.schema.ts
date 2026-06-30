import { z } from "zod";

export const createPositionSchema = z.object({
  body: z.object({
    code: z
      .string({ message: "Position code is required" })
      .min(2, "Position code must be at least 2 characters"),
    name: z
      .string({ message: "Position name is required" })
      .min(2, "Position name must be at least 2 characters"),
    industryId: z
      .string({ message: "Industry is required" })
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid industry id"),
  }),
});

export const updatePositionSchema = z.object({
  params: z.object({
    id: z
      .string({ message: "Position ID is required" })
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId"),
  }),
  body: z.object({
    name: z.string().min(2, "Position name must be at least 2 characters").optional(),
    industryId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid industry id")
      .optional(),
    isActive: z.boolean().optional(),
  }),
});

export type CreatePositionInput = z.infer<typeof createPositionSchema>["body"];
export type UpdatePositionInput = z.infer<typeof updatePositionSchema>["body"];
