# WorkShift Backend Structure

```
src/
├── common/
│   ├── logger/           # Pino logger + HTTP request logging
│   ├── response/         # Unified API response format
│   ├── filters/          # Global exception filter
│   └── pipes/            # Zod validation pipe
├── config/
│   ├── env.schema.ts     # Zod env validation
│   ├── env.ts
│   ├── database.ts
│   └── swagger.ts
├── middleware/           # Re-exports (backward compat)
└── modules/
```

## Infrastructure

| Thành phần | File | Mô tả |
|------------|------|--------|
| Logger | `common/logger` | Pino + `pino-http`, `x-request-id` |
| Exception filter | `common/filters/exception.filter.ts` | Map lỗi → `ApiErrorResponse` |
| Response format | `common/response` | `{ success, statusCode, data, meta }` |
| Validation pipe | `common/pipes/validation.pipe.ts` | `ValidationPipe(schema)` |
| Env config | `config/env.schema.ts` | Zod validate `.env` lúc khởi động |
| Swagger | `config/swagger.ts` | `/api/docs`, `/api/docs.json` |

## Response mẫu

**Success:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": { ... },
  "meta": { "timestamp": "...", "requestId": "...", "path": "/api/auth/google" }
}
```

**Error:**
```json
{
  "success": false,
  "statusCode": 422,
  "message": "Validation failed",
  "errors": [{ "field": "body.idToken", "message": "..." }],
  "meta": { "timestamp": "...", "requestId": "...", "path": "..." }
}
```
