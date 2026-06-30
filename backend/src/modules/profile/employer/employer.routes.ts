import { Router } from "express";
import { authenticate } from "../../../middleware/auth.js";
import { ValidationPipe } from "../../../common/pipes/validation.pipe.js";
import { uploadEmployerLogo } from "../../../middleware/uploadEmployerLogo.js";
import {
  createEmployerProfileSchema,
  sendEmployerEmailOtpSchema,
  updateEmployerProfileSchema,
  verifyEmployerEmailOtpSchema,
} from "./employer.schema.js";
import { EmployerController } from "./employer.controller.js";

/** /api/employer/profile — hồ sơ nhà tuyển dụng */
const router = Router();

router.use(authenticate);

router.post(
  "/",
  ValidationPipe(createEmployerProfileSchema),
  EmployerController.createProfile,
);

router.get("/", EmployerController.getProfile);

router.put(
  "/",
  ValidationPipe(updateEmployerProfileSchema),
  EmployerController.updateProfile,
);

router.post(
  "/send-email-otp",
  ValidationPipe(sendEmployerEmailOtpSchema),
  EmployerController.sendEmailOtp,
);

router.post(
  "/verify-email",
  ValidationPipe(verifyEmployerEmailOtpSchema),
  EmployerController.verifyEmailOtp,
);

router.post("/logo", uploadEmployerLogo, EmployerController.uploadLogo);

export default router;
