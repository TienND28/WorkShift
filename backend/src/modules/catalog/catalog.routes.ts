import { Router } from "express";

import { validate } from "../../middleware/validate.js";

import { CatalogController } from "./catalog.controller.js";

import { listPositionsQuerySchema } from "./catalog.schema.js";



/** /api/catalog — danh mục đọc-only cho onboarding (không cần đăng nhập) */

const router = Router();



// Ngành nghề đang hoạt động

router.get("/industries", CatalogController.listIndustries);



// Vị trí công việc; ?industryId=... lọc theo ngành

router.get(

  "/positions",

  validate(listPositionsQuerySchema),

  CatalogController.listPositions,

);



export default router;

