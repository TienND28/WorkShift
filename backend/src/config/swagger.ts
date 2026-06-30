import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import type { Express } from "express";
import { ENV } from "./env.js";

const swaggerDefinition = {
  openapi: "3.0.3",
  info: {
    title: "WorkShift API",
    version: "1.0.0",
    description:
      "API tuyển dụng ca làm casual — đăng nhập Google, JWT, refresh token.",
  },
  servers: [
    {
      url: `http://localhost:${ENV.port}/api`,
      description: "Local development",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      ApiSuccess: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          statusCode: { type: "integer", example: 200 },
          message: { type: "string" },
          data: { type: "object" },
          meta: {
            type: "object",
            properties: {
              timestamp: { type: "string", format: "date-time" },
              requestId: { type: "string" },
              path: { type: "string" },
            },
          },
        },
      },
      ApiError: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          statusCode: { type: "integer", example: 400 },
          message: { type: "string" },
          errors: { type: "object" },
          meta: {
            type: "object",
            properties: {
              timestamp: { type: "string", format: "date-time" },
              requestId: { type: "string" },
              path: { type: "string" },
            },
          },
        },
      },
      GoogleAuthBody: {
        type: "object",
        required: ["idToken"],
        properties: {
          idToken: {
            type: "string",
            description: "Google ID token (credential) from GIS",
          },
        },
      },
      RefreshTokenBody: {
        type: "object",
        required: ["refreshToken"],
        properties: {
          refreshToken: { type: "string" },
        },
      },
      AuthTokens: {
        type: "object",
        properties: {
          accessToken: { type: "string" },
          refreshToken: { type: "string" },
          user: { type: "object" },
        },
      },
      WorkerProfileBody: {
        type: "object",
        properties: {
          bio: { type: "string", maxLength: 2000 },
          expectedSalary: { type: "number", minimum: 0 },
          preferredIndustryIds: {
            type: "array",
            items: { type: "string" },
            description: "MongoDB ObjectId của Industry (ngành nghề ưa thích)",
          },
          preferredPositionIds: {
            type: "array",
            items: { type: "string" },
            description: "MongoDB ObjectId của Position",
          },
          preferredDistrictIds: {
            type: "array",
            items: { type: "string" },
            description: "MongoDB ObjectId của District (khu vực ưa thích)",
          },
          availabilities: {
            type: "array",
            items: {
              type: "object",
              required: ["weekday", "startTime", "endTime"],
              properties: {
                weekday: {
                  type: "integer",
                  minimum: 0,
                  maximum: 6,
                  description: "0=Chủ nhật … 6=Thứ bảy",
                },
                startTime: { type: "string", example: "09:00" },
                endTime: { type: "string", example: "17:00" },
              },
            },
          },
        },
      },
    },
  },
  paths: {
    "/auth/google": {
      post: {
        tags: ["Auth"],
        summary: "Đăng nhập bằng Google",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/GoogleAuthBody" },
            },
          },
        },
        responses: {
          "200": {
            description: "Đăng nhập thành công",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/ApiSuccess" },
                    {
                      properties: {
                        data: { $ref: "#/components/schemas/AuthTokens" },
                      },
                    },
                  ],
                },
              },
            },
          },
          "401": {
            description: "Token Google không hợp lệ",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiError" },
              },
            },
          },
        },
      },
    },
    "/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Làm mới access token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RefreshTokenBody" },
            },
          },
        },
        responses: {
          "200": {
            description: "Token mới",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiSuccess" },
              },
            },
          },
        },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Thông tin user hiện tại",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Profile",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiSuccess" },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiError" },
              },
            },
          },
        },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Đăng xuất (revoke refresh session)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  refreshToken: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Đăng xuất thành công",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiSuccess" },
              },
            },
          },
        },
      },
    },
    "/worker/profile": {
      post: {
        tags: ["Worker Profile"],
        summary: "Tạo hoặc khởi tạo hồ sơ worker",
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/WorkerProfileBody" },
            },
          },
        },
        responses: {
          "201": {
            description: "Hồ sơ worker",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiSuccess" },
              },
            },
          },
        },
      },
      get: {
        tags: ["Worker Profile"],
        summary: "Lấy hồ sơ worker hiện tại",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Hồ sơ worker",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiSuccess" },
              },
            },
          },
        },
      },
      patch: {
        tags: ["Worker Profile"],
        summary: "Cập nhật hồ sơ worker",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/WorkerProfileBody" },
            },
          },
        },
        responses: {
          "200": {
            description: "Hồ sơ đã cập nhật",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiSuccess" },
              },
            },
          },
        },
      },
    },
  },
};

const options: swaggerJsdoc.Options = {
  definition: swaggerDefinition,
  apis: ["./src/modules/**/*.routes.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
  if (!ENV.swaggerEnabled) return;

  app.use(
    "/api/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customSiteTitle: "WorkShift API Docs",
      swaggerOptions: {
        persistAuthorization: true,
      },
    }),
  );

  app.get("/api/docs.json", (_req, res) => {
    res.json(swaggerSpec);
  });
};
