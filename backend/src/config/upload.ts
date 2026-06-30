import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const UPLOADS_ROOT = path.resolve(__dirname, "../../uploads");
export const ORGANIZATION_LOGO_DIR = path.join(UPLOADS_ROOT, "organizations");
export const EMPLOYER_LOGO_DIR = path.join(UPLOADS_ROOT, "employers");
export const USER_AVATAR_DIR = path.join(UPLOADS_ROOT, "avatars");

export const LOGO_MAX_BYTES = 2 * 1024 * 1024;
export const LOGO_ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
