import fs from "fs";
import path from "path";
import multer from "multer";
import { BadRequestError } from "../utils/errors.js";
import {
  EMPLOYER_LOGO_DIR,
  LOGO_ALLOWED_MIME,
  LOGO_MAX_BYTES,
} from "../config/upload.js";

if (!fs.existsSync(EMPLOYER_LOGO_DIR)) {
  fs.mkdirSync(EMPLOYER_LOGO_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, EMPLOYER_LOGO_DIR);
  },
  filename: (req, file, cb) => {
    const userId = req.user?.userId ?? "unknown";
    const ext = path.extname(file.originalname).toLowerCase() || ".png";
    cb(null, `${userId}-logo-${Date.now()}${ext}`);
  },
});

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (!LOGO_ALLOWED_MIME.has(file.mimetype)) {
    cb(new BadRequestError("Logo must be JPEG, PNG, or WebP"));
    return;
  }
  cb(null, true);
};

export const uploadEmployerLogo = multer({
  storage,
  limits: { fileSize: LOGO_MAX_BYTES },
  fileFilter,
}).single("logo");
