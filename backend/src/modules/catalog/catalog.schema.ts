import { z } from "zod";
import { objectIdSchema } from "../../common/schemas/objectId.schema.js";

export const listPositionsQuerySchema = z.object({
  query: z.object({
    industryId: objectIdSchema.optional(),
  }),
});
