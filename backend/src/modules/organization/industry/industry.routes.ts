import { Router } from "express";
import { validate } from "../../../middleware/validate.js";
import {
  authGuard,
  adminGuard,
  optionalAuthGuard,
} from "../../../middleware/guards.js";
import { createIndustrySchema, updateIndustrySchema } from "./industry.schema.js";
import { IndustryController } from "./industry.controller.js";
import { objectIdParamSchema } from "../../../common/schemas/objectIdParam.schema.js";

const router = Router();

/**
 * Public routes
 */

// GET /api/industries - Get active industries
router.get("/", IndustryController.getActive);

// GET /api/industries/:id - Get industry by id
router.get(
  "/:id",
  optionalAuthGuard(),
  validate(objectIdParamSchema()),
  IndustryController.getById
);

/**
 * Admin routes
 * Require authentication & admin role
 */

// POST /api/industries - Create new industry
router.post(
  "/",
  authGuard(),
  adminGuard(),
  validate(createIndustrySchema),
  IndustryController.create
);

// GET /api/industries/admin/all - Get all industries (including inactive)
router.get("/admin/all", authGuard(), adminGuard(), IndustryController.getAll);

// PUT /api/industries/:id - Update industry
router.put(
  "/:id",
  authGuard(),
  adminGuard(),
  validate(updateIndustrySchema),
  IndustryController.update
);

// DELETE /api/industries/:id - Delete industry
router.delete(
  "/:id",
  authGuard(),
  adminGuard(),
  validate(objectIdParamSchema()),
  IndustryController.delete
);

export default router;
