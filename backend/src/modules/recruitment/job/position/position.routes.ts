import { Router } from "express";

import { objectIdParamSchema } from "../../../../common/schemas/objectIdParam.schema.js";

import {

  adminGuard,

  authGuard,

} from "../../../../middleware/guards.js";

import { validate } from "../../../../middleware/validate.js";

import { PositionController } from "./position.controller.js";

import {

  createPositionSchema,

  updatePositionSchema,

} from "./position.schema.js";



/** /api/positions — quản trị vị trí công việc (gắn với industryId) */

const router = Router();



// Vị trí đang hoạt động; ?industryId=... lọc theo ngành

router.get("/", PositionController.getActive);



// Tất cả vị trí (admin)

router.get("/admin/all", authGuard(), adminGuard(), PositionController.getAll);



// Chi tiết vị trí

router.get(

  "/:id",

  validate(objectIdParamSchema()),

  PositionController.getById,

);



// Tạo vị trí mới trong một ngành (admin)

router.post(

  "/",

  authGuard(),

  adminGuard(),

  validate(createPositionSchema),

  PositionController.create,

);



// Cập nhật vị trí (admin)

router.put(

  "/:id",

  authGuard(),

  adminGuard(),

  validate(updatePositionSchema),

  PositionController.update,

);



// Xóa / vô hiệu vị trí (admin)

router.delete(

  "/:id",

  authGuard(),

  adminGuard(),

  validate(objectIdParamSchema()),

  PositionController.delete,

);



export default router;

