import { Router } from "express";
import { authenticate } from "../../../middleware/auth.js";
import { ValidationPipe } from "../../../common/pipes/validation.pipe.js";
import {
  requireOrganizationMember,
  requireOrganizationRecruiter,
} from "../../organization/organization.middleware.js";
import {
  addJobsSchema,
  assignSlotSchema,
  createJobPostingSchema,
  createShiftTemplateSchema,
  generateShiftDatesSchema,
  postingIdParamSchema,
  postingShiftDateParamSchema,
  templateIdParamSchema,
  updateJobPostingSchema,
  updateShiftDateSchema,
} from "./job-posting.schema.js";
import { JobPostingController } from "./job-posting.controller.js";

/**
 * /api/organizations/:organizationId/job-postings
 * Quản lý tin tuyển dụng, ca làm, slot (mergeParams)
 */
const router = Router({ mergeParams: true });

router.use(authenticate);

// Tạo bài đăng tuyển dụng mới
router.post(
  "/",
  requireOrganizationRecruiter,
  ValidationPipe(createJobPostingSchema),
  JobPostingController.create,
);

// Danh sách bài đăng của tổ chức
router.get("/", requireOrganizationMember, JobPostingController.list);

// Chi tiết bài đăng
router.get(
  "/:postingId",
  requireOrganizationMember,
  ValidationPipe(postingIdParamSchema),
  JobPostingController.getDetail,
);

// Sửa thông tin bài đăng (nháp)
router.patch(
  "/:postingId",
  requireOrganizationRecruiter,
  ValidationPipe(updateJobPostingSchema),
  JobPostingController.update,
);

// Xuất bản bài đăng
router.post(
  "/:postingId/publish",
  requireOrganizationRecruiter,
  ValidationPipe(postingIdParamSchema),
  JobPostingController.publish,
);

// Đóng bài đăng (ngừng tuyển)
router.post(
  "/:postingId/close",
  requireOrganizationRecruiter,
  ValidationPipe(postingIdParamSchema),
  JobPostingController.close,
);

// Xóa bài đăng
router.delete(
  "/:postingId",
  requireOrganizationRecruiter,
  ValidationPipe(postingIdParamSchema),
  JobPostingController.delete,
);

// Thêm vị trí tuyển (job) vào bài đăng
router.post(
  "/:postingId/jobs",
  requireOrganizationRecruiter,
  ValidationPipe(addJobsSchema),
  JobPostingController.addJobs,
);

// Tạo mẫu ca (shift template) cho một job
router.post(
  "/:postingId/jobs/:jobId/shift-templates",
  requireOrganizationRecruiter,
  ValidationPipe(createShiftTemplateSchema),
  JobPostingController.createShiftTemplate,
);

// Sinh các ngày ca từ template (theo khoảng ngày)
router.post(
  "/:postingId/jobs/:jobId/shift-templates/:templateId/dates/generate",
  requireOrganizationRecruiter,
  ValidationPipe(generateShiftDatesSchema),
  JobPostingController.generateShiftDates,
);

// Danh sách ngày ca của template
router.get(
  "/:postingId/jobs/:jobId/shift-templates/:templateId/dates",
  requireOrganizationMember,
  ValidationPipe(templateIdParamSchema),
  JobPostingController.listShiftDates,
);

// Mở nhận ứng viên cho ngày ca
router.post(
  "/:postingId/shift-dates/:shiftDateId/open",
  requireOrganizationRecruiter,
  ValidationPipe(postingShiftDateParamSchema),
  JobPostingController.openShiftDate,
);

// Đóng ngày ca
router.post(
  "/:postingId/shift-dates/:shiftDateId/close",
  requireOrganizationRecruiter,
  ValidationPipe(postingShiftDateParamSchema),
  JobPostingController.closeShiftDate,
);

// Cập nhật thông tin ngày ca (số lượng, yêu cầu...)
router.patch(
  "/:postingId/shift-dates/:shiftDateId",
  requireOrganizationRecruiter,
  ValidationPipe(updateShiftDateSchema),
  JobPostingController.updateShiftDate,
);

// Tạo các slot (chỗ) trong ngày ca
router.post(
  "/:postingId/shift-dates/:shiftDateId/slots/generate",
  requireOrganizationRecruiter,
  ValidationPipe(postingShiftDateParamSchema),
  JobPostingController.generateSlots,
);

// Danh sách slot của ngày ca
router.get(
  "/:postingId/shift-dates/:shiftDateId/slots",
  requireOrganizationMember,
  ValidationPipe(postingShiftDateParamSchema),
  JobPostingController.listSlots,
);

// Gán worker vào slot
router.post(
  "/:postingId/shift-dates/:shiftDateId/slots/:slotId/assign",
  requireOrganizationRecruiter,
  ValidationPipe(assignSlotSchema),
  JobPostingController.assignSlot,
);

export default router;
