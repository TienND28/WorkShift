import fs from "fs";
import path from "path";
import multer from "multer";
import { BadRequestError } from "../utils/errors.js";
import {
  LOGO_ALLOWED_MIME,
  LOGO_MAX_BYTES,
  USER_AVATAR_DIR,
} from "../config/upload.js";

if (!fs.existsSync(USER_AVATAR_DIR)) {
  fs.mkdirSync(USER_AVATAR_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, USER_AVATAR_DIR);
  },
  filename: (req, file, cb) => {
    const userId = req.user?.userId ?? "unknown";
    const ext = path.extname(file.originalname).toLowerCase() || ".png";
    cb(null, `${userId}-avatar-${Date.now()}${ext}`);
  },
});

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (!LOGO_ALLOWED_MIME.has(file.mimetype)) {
    cb(new BadRequestError("Avatar must be JPEG, PNG, or WebP"));
    return;
  }
  cb(null, true);
};

export const uploadUserAvatar = multer({
  storage,
  limits: { fileSize: LOGO_MAX_BYTES },
  fileFilter,
}).single("avatar");
