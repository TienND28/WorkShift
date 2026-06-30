import fs from "fs";
import path from "path";
import multer from "multer";
import type { Request } from "express";
import { BadRequestError } from "../utils/errors.js";
import {
  LOGO_ALLOWED_MIME,
  LOGO_MAX_BYTES,
  ORGANIZATION_LOGO_DIR,
} from "../config/upload.js";

if (!fs.existsSync(ORGANIZATION_LOGO_DIR)) {
  fs.mkdirSync(ORGANIZATION_LOGO_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, ORGANIZATION_LOGO_DIR);
  },
  filename: (req, file, cb) => {
    const orgId = req.params.organizationId ?? "unknown";
    const ext = path.extname(file.originalname).toLowerCase() || ".png";
    cb(null, `${orgId}-logo-${Date.now()}${ext}`);
  },
});

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (!LOGO_ALLOWED_MIME.has(file.mimetype)) {
    cb(new BadRequestError("Logo must be JPEG, PNG, or WebP"));
    return;
  }
  cb(null, true);
};

export const uploadOrganizationLogo = multer({
  storage,
  limits: { fileSize: LOGO_MAX_BYTES },
  fileFilter,
}).single("logo");
