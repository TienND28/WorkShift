import { Router } from "express";

import { authenticate } from "../../middleware/auth.js";

import { ValidationPipe } from "../../common/pipes/validation.pipe.js";

import { updateUserSchema } from "./user.update.schema.js";

import { UserController } from "./user.controller.js";

import { uploadUserAvatar } from "../../middleware/uploadAvatar.js";



/** /api/users — thông tin tài khoản chung (không phân worker/employer) */

const router = Router();



router.use(authenticate);



// Cập nhật họ tên, SĐT, ngày sinh, giới tính...

router.patch("/me", ValidationPipe(updateUserSchema), UserController.updateMe);



// Upload ảnh đại diện user

router.post("/me/avatar", uploadUserAvatar, UserController.uploadAvatar);



export default router;

