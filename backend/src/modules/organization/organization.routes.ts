import { Router, type Request, type Response, type NextFunction } from "express";
import { authenticate } from "../../middleware/auth.js";
import { ValidationPipe } from "../../common/pipes/validation.pipe.js";
import { uploadOrganizationLogo } from "../../middleware/uploadLogo.js";
import {
  createOrganizationSchema,
  inviteMemberSchema,
  organizationIdParamSchema,
  updateMemberRoleSchema,
  updateOrganizationSchema,
} from "./organization.schema.js";
import {
  requireOrganizationManager,
  requireOrganizationMember,
} from "./organization.middleware.js";
import { OrganizationController } from "./organization.controller.js";
import jobPostingRoutes from "../recruitment/job/job-posting.routes.js";

/** /api/organizations — quản lý tổ chức / doanh nghiệp tuyển dụng */
const router = Router();

router.use(authenticate);

const handleLogoUpload = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  uploadOrganizationLogo(req, res, (err) => {
    if (err) return next(err);
    next();
  });
};

// Danh sách vai trò thành viên (OWNER, MANAGER, ...)
router.get("/member-roles", OrganizationController.getMemberRoles);

// Tạo tổ chức mới (onboarding employer)
router.post(
  "/",
  ValidationPipe(createOrganizationSchema),
  OrganizationController.create,
);

// Danh sách tổ chức user đang tham gia
router.get("/", OrganizationController.listMine);

// Chi tiết một tổ chức (phải là thành viên)
router.get(
  "/:organizationId",
  ValidationPipe(organizationIdParamSchema),
  requireOrganizationMember,
  OrganizationController.getById,
);

// Cập nhật thông tin tổ chức (manager trở lên)
router.patch(
  "/:organizationId",
  ValidationPipe(updateOrganizationSchema),
  requireOrganizationManager,
  OrganizationController.update,
);

// Upload logo tổ chức
router.post(
  "/:organizationId/logo",
  ValidationPipe(organizationIdParamSchema),
  requireOrganizationManager,
  handleLogoUpload,
  OrganizationController.uploadLogo,
);

// Danh sách thành viên trong tổ chức
router.get(
  "/:organizationId/members",
  ValidationPipe(organizationIdParamSchema),
  requireOrganizationMember,
  OrganizationController.listMembers,
);

// Mời thành viên vào tổ chức
router.post(
  "/:organizationId/members/invite",
  ValidationPipe(inviteMemberSchema),
  requireOrganizationManager,
  OrganizationController.inviteMember,
);

// Đổi vai trò thành viên
router.patch(
  "/:organizationId/members/:memberId",
  ValidationPipe(updateMemberRoleSchema),
  requireOrganizationManager,
  OrganizationController.updateMemberRole,
);

// Tin tuyển dụng / ca làm của tổ chức → /api/organizations/:id/job-postings/...
router.use("/:organizationId/job-postings", jobPostingRoutes);

export default router;
