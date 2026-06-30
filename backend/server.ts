import express, { type Request, type Response } from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { createServer } from "http";

import { ENV, validateEnv } from "./src/config/env.js";
import { UPLOADS_ROOT } from "./src/config/upload.js";
import { connectDB } from "./src/config/database.js";
import { setupSwagger } from "./src/config/swagger.js";
import { httpLogger, logger } from "./src/common/logger/index.js";
import {
  exceptionFilter,
  notFoundFilter,
} from "./src/common/filters/exception.filter.js";
import { buildSuccessResponse } from "./src/common/response/response.util.js";
import authRoutes from "./src/modules/auth/auth.routes.js";
import workerProfileRoutes from "./src/modules/profile/worker/worker.routes.js";
import employerProfileRoutes from "./src/modules/profile/employer/employer.routes.js";
import organizationRoutes from "./src/modules/organization/organization.routes.js";
import userRoutes from "./src/modules/user/user.routes.js";
import locationRoutes from "./src/modules/location/location.routes.js";
import catalogRoutes from "./src/modules/catalog/catalog.routes.js";
import industryRoutes from "./src/modules/organization/industry/industry.routes.js";
import positionRoutes from "./src/modules/recruitment/job/position/position.routes.js";

validateEnv();

const app = express();
const httpServer = createServer(app);
const __dirname = path.resolve();

app.set("trust proxy", 1);

app.use(helmet({ contentSecurityPolicy: ENV.nodeEnv === "production" }));
app.use(
  cors({
    origin: ENV.corsOrigin,
    credentials: true,
  }),
);

app.use(httpLogger);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

setupSwagger(app);

app.use("/uploads", express.static(UPLOADS_ROOT));

app.get("/", (req: Request, res: Response) => {
  res.json(
    buildSuccessResponse(
      {
        name: "WorkShift API",
        version: "1.0.0",
        environment: ENV.nodeEnv,
        docs: ENV.swaggerEnabled ? `/api/docs` : null,
      },
      { message: "WorkShift API - Casual Job Platform", req },
    ),
  );
});

// --- API modules ---
app.use("/api/auth", authRoutes); // Đăng nhập, phiên, chọn vai trò onboarding
app.use("/api/users", userRoutes); // Cập nhật thông tin tài khoản & avatar
app.use("/api/worker/profile", workerProfileRoutes); // Hồ sơ người lao động
app.use("/api/employer/profile", employerProfileRoutes); // Hồ sơ nhà tuyển dụng
app.use("/api/organizations", organizationRoutes); // Tổ chức, thành viên, tin tuyển dụng
app.use("/api/locations", locationRoutes); // Tỉnh / quận / phường (địa điểm)
app.use("/api/catalog", catalogRoutes); // Danh mục công khai (ngành, vị trí) cho onboarding
app.use("/api/industries", industryRoutes); // CRUD ngành nghề (admin)
app.use("/api/positions", positionRoutes); // CRUD vị trí công việc (admin)

if (ENV.nodeEnv === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.use((req, res, next) => {
    if (!req.path.startsWith("/api")) {
      res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    } else {
      next();
    }
  });
}

app.use(notFoundFilter);
app.use(exceptionFilter);

const startServer = async () => {
  try {
    await connectDB();

    httpServer.listen(ENV.port, () => {
      logger.info(
        {
          port: ENV.port,
          env: ENV.nodeEnv,
          api: `http://localhost:${ENV.port}/api`,
          docs: ENV.swaggerEnabled
            ? `http://localhost:${ENV.port}/api/docs`
            : "disabled",
        },
        "WorkShift API started",
      );
    });
  } catch (error) {
    logger.fatal({ err: error }, "Failed to start server");
    process.exit(1);
  }
};

startServer();

export default app;
