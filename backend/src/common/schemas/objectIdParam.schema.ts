import z from "zod";

export const objectIdParamSchema = (key = "id") =>
  z.object({
    params: z.object({
      [key]: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id"),
    }),
  });

