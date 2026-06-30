import { z } from "zod";
import { Gender } from "../../common/enums/gender.enum.js";

export const updateUserSchema = z.object({
  body: z
    .object({
      fullName: z.string().trim().min(2).max(120).optional(),
      phone: z
        .string()
        .trim()
        .regex(/^(0|\+84)[0-9]{9,10}$/, "Invalid Vietnamese phone number")
        .optional(),
      gender: z.enum([Gender.MALE, Gender.FEMALE, Gender.OTHER, Gender.ANY]).optional(),
      dateOfBirth: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
        .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided",
    }),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>["body"];
