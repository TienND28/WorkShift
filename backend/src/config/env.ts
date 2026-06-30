import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { envSchema, type EnvSchema } from "./env.schema.js";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const formatted = parsed.error.issues
    .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
    .join("\n");
  console.error(`❌ Invalid environment variables:\n${formatted}`);
  process.exit(1);
}

const env: EnvSchema = parsed.data;

export interface EnvConfig {
  port: number;
  nodeEnv: EnvSchema["NODE_ENV"];
  logLevel: EnvSchema["LOG_LEVEL"];
  mongoUri: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  jwtRefreshExpiresIn: string;
  googleClientId?: string;
  googleClientSecret?: string;
  appUrl: string;
  emailFrom: string;
  smtpHost?: string;
  smtpPort: number;
  smtpUser?: string;
  smtpPass?: string;
  smtpSecure: boolean;
  corsOrigin: string;
  swaggerEnabled: boolean;
  defaultPageSize: number;
  maxPageSize: number;
}

export const ENV: EnvConfig = {
  port: env.PORT,
  nodeEnv: env.NODE_ENV,
  logLevel: env.LOG_LEVEL,
  mongoUri: env.MONGO_URI,
  jwtSecret: env.JWT_SECRET,
  jwtExpiresIn: env.JWT_EXPIRES_IN,
  jwtRefreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  ...(env.GOOGLE_CLIENT_ID ? { googleClientId: env.GOOGLE_CLIENT_ID } : {}),
  ...(env.GOOGLE_CLIENT_SECRET
    ? { googleClientSecret: env.GOOGLE_CLIENT_SECRET }
    : {}),
  appUrl: env.APP_URL,
  emailFrom: env.EMAIL_FROM,
  ...(env.SMTP_HOST ? { smtpHost: env.SMTP_HOST } : {}),
  smtpPort: env.SMTP_PORT,
  ...(env.SMTP_USER ? { smtpUser: env.SMTP_USER } : {}),
  ...(env.SMTP_PASS ? { smtpPass: env.SMTP_PASS } : {}),
  smtpSecure: env.SMTP_SECURE,
  corsOrigin: env.CORS_ORIGIN,
  swaggerEnabled: env.SWAGGER_ENABLED,
  defaultPageSize: 10,
  maxPageSize: 100,
};

export const validateEnv = (): void => {
  // Logger may not be initialized yet — keep bootstrap log minimal
  if (ENV.nodeEnv === "development") {
    console.log(
      `✅ Env OK — ${ENV.nodeEnv} :${ENV.port} swagger=${ENV.swaggerEnabled}`,
    );
  }
};

export const isProduction = (): boolean => ENV.nodeEnv === "production";
export const isDevelopment = (): boolean => ENV.nodeEnv === "development";
export const isTest = (): boolean => ENV.nodeEnv === "test";
