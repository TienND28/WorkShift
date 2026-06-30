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



/** /api/industries — quản trị ngành nghề (admin) + xem danh sách active */

const router = Router();



// Ngành đang hoạt động (public)

router.get("/", IndustryController.getActive);



// Tất cả ngành kể cả ẩn (admin)

router.get("/admin/all", authGuard(), adminGuard(), IndustryController.getAll);



// Tạo ngành mới (admin)

router.post(

  "/",

  authGuard(),

  adminGuard(),

  validate(createIndustrySchema),

  IndustryController.create,

);



// Chi tiết một ngành

router.get(

  "/:id",

  optionalAuthGuard(),

  validate(objectIdParamSchema()),

  IndustryController.getById,

);



// Cập nhật ngành (admin)

router.put(

  "/:id",

  authGuard(),

  adminGuard(),

  validate(updateIndustrySchema),

  IndustryController.update,

);



// Xóa / vô hiệu ngành (admin)

router.delete(

  "/:id",

  authGuard(),

  adminGuard(),

  validate(objectIdParamSchema()),

  IndustryController.delete,

);



export default router;

