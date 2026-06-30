import { Router } from "express";
import { authenticate } from "../../../middleware/auth.js";
import {
  validateCreateWorkerProfile,
  validateUpdateWorkerProfile,
} from "./worker.validation.js";
import { WorkerController } from "./worker.controller.js";

/** /api/worker/profile — hồ sơ người lao động (onboarding & chỉnh sửa) */
const router = Router();

router.use(authenticate);

// Tạo hồ sơ worker lần đầu (sau khi chọn vai trò WORKER)
router.get("/limits", WorkerController.getProfileLimits);

router.post("/", validateCreateWorkerProfile, WorkerController.createProfile);

// Xem hồ sơ worker hiện tại
router.get("/", WorkerController.getProfile);

// Cập nhật vị trí ưa thích, khu vực, khung giờ rảnh...
router.patch("/", validateUpdateWorkerProfile, WorkerController.updateProfile);

export default router;
