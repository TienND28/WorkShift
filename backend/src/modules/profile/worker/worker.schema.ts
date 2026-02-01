import { z } from "zod";

export const createWorkerTypeSchema = z.object({
  body: z.object({
    userId: z
      .string({
        message: "User ID is required",
      })
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId"),
  }),
});
