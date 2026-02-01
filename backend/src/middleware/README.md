# Middleware Documentation

Thư mục này chứa các middleware functions cho authentication, authorization, validation và error handling.

## Cấu trúc

```
middleware/
├── index.ts          # Barrel export
├── auth.ts           # Authentication & basic authorization
├── guards.ts         # Guard functions (composable)
├── validate.ts       # Request validation
└── errorHandler.ts   # Error handling
```

## Authentication & Authorization

### Basic Functions (`auth.ts`)

#### `authenticate`
Xác thực user từ JWT token. Yêu cầu token hợp lệ.

```typescript
import { authenticate } from '@/middleware';

router.get('/protected', authenticate, controller.getProtected);
```

#### `authorize(...roles)`
Kiểm tra user có role phù hợp.

```typescript
import { authorize } from '@/middleware';
import { UserRole } from '@/modules/user/user.schema';

router.post('/admin', authenticate, authorize(UserRole.ADMIN), controller.create);
router.get('/staff', authenticate, authorize(UserRole.ADMIN, UserRole.BUSINESS), controller.getStaff);
```

#### `optionalAuth`
Xác thực tùy chọn - không bắt buộc token.

```typescript
import { optionalAuth } from '@/middleware';

router.get('/public', optionalAuth, controller.getPublic); // Works with or without token
```

### Guard Functions (`guards.ts`) - Khuyến nghị sử dụng

Guard functions giúp code dễ đọc và maintain hơn.

#### `authGuard()`
Yêu cầu authentication.

```typescript
import { authGuard } from '@/middleware/guards';

router.get('/profile', authGuard(), controller.getProfile);
```

#### `roleGuard(...roles)`
Yêu cầu role cụ thể.

```typescript
import { roleGuard } from '@/middleware/guards';
import { UserRole } from '@/modules/user/user.schema';

router.post('/create', authGuard(), roleGuard(UserRole.ADMIN), controller.create);
```

#### `adminGuard()`
Yêu cầu admin role (shortcut).

```typescript
import { adminGuard } from '@/middleware/guards';

router.post('/admin', authGuard(), adminGuard(), controller.create);
```

#### `employerGuard()`
Yêu cầu employer role.

```typescript
import { employerGuard } from '@/middleware/guards';

router.get('/jobs', authGuard(), employerGuard(), controller.getJobs);
```

#### `workerGuard()`
Yêu cầu worker role.

```typescript
import { workerGuard } from '@/middleware/guards';

router.get('/applications', authGuard(), workerGuard(), controller.getApplications);
```

#### `adminOrEmployerGuard()`
Yêu cầu admin hoặc employer.

```typescript
import { adminOrEmployerGuard } from '@/middleware/guards';

router.get('/dashboard', authGuard(), adminOrEmployerGuard(), controller.getDashboard);
```

#### `optionalAuthGuard()`
Xác thực tùy chọn.

```typescript
import { optionalAuthGuard } from '@/middleware/guards';

router.get('/public', optionalAuthGuard(), controller.getPublic);
```

### Helper Functions

#### `hasRole(userRole, ...allowedRoles)`
Kiểm tra user có role phù hợp (dùng trong controller/service).

```typescript
import { hasRole } from '@/middleware/guards';
import { UserRole } from '@/modules/user/user.schema';

if (hasRole(req.user?.role, UserRole.ADMIN)) {
  // Admin only logic
}
```

#### `isAdmin(userRole)`, `isEmployer(userRole)`, `isWorker(userRole)`
Kiểm tra role cụ thể.

```typescript
import { isAdmin, isEmployer } from '@/middleware/guards';

if (isAdmin(req.user?.role)) {
  // Admin logic
}
```

## Validation

### `validate(schema)`
Validate toàn bộ request (body, query, params).

```typescript
import { validate } from '@/middleware';
import { createUserSchema } from './user.schema';

router.post('/users', validate(createUserSchema), controller.create);
```

### `validateBody(schema)`
Chỉ validate body.

```typescript
import { validateBody } from '@/middleware';

router.post('/users', validateBody(createUserSchema), controller.create);
```

### `validateQuery(schema)`
Chỉ validate query parameters.

```typescript
import { validateQuery } from '@/middleware';

router.get('/users', validateQuery(paginationSchema), controller.list);
```

### `validateParams(schema)`
Chỉ validate route parameters.

```typescript
import { validateParams } from '@/middleware';

router.get('/users/:id', validateParams(idSchema), controller.getById);
```

## Error Handling

### `errorHandler`
Global error handler middleware (đặt cuối cùng).

```typescript
import { errorHandler } from '@/middleware';

app.use(errorHandler);
```

### `notFoundHandler`
404 handler cho routes không tồn tại.

```typescript
import { notFoundHandler } from '@/middleware';

app.use(notFoundHandler);
```

## Ví dụ sử dụng

### Route với authentication và authorization

```typescript
import { Router } from 'express';
import { authGuard, adminGuard } from '@/middleware/guards';
import { validate } from '@/middleware';
import { createSchema } from './schema';

const router = Router();

// Public route
router.get('/', controller.getAll);

// Protected route (require auth)
router.get('/:id', authGuard(), controller.getById);

// Admin only route
router.post(
  '/',
  authGuard(),
  adminGuard(),
  validate(createSchema),
  controller.create
);

// Multiple roles
router.put(
  '/:id',
  authGuard(),
  roleGuard(UserRole.ADMIN, UserRole.BUSINESS),
  validate(updateSchema),
  controller.update
);

export default router;
```

### Sử dụng helper functions trong controller

```typescript
import { isAdmin, hasRole } from '@/middleware/guards';
import { UserRole } from '@/modules/user/user.schema';

export const MyController = {
  async getData(req: Request, res: Response) {
    const userRole = req.user?.role;
    
    // Check role
    if (isAdmin(userRole)) {
      // Admin sees all data
      return sendSuccess(res, allData);
    }
    
    // Regular user sees limited data
    return sendSuccess(res, limitedData);
  },
  
  async update(req: Request, res: Response) {
    const userRole = req.user?.role;
    
    // Multiple role check
    if (hasRole(userRole, UserRole.ADMIN, UserRole.BUSINESS)) {
      // Admin or employer can update
      return sendSuccess(res, updatedData);
    }
    
    throw new ForbiddenError('Access denied');
  }
};
```

## Best Practices

1. **Sử dụng Guards thay vì basic functions** - Code dễ đọc hơn
2. **Luôn validate input** - Sử dụng `validate()` với Zod schemas
3. **Chain middleware đúng thứ tự**:
   ```
   authGuard() → roleGuard() → validate() → controller
   ```
4. **Sử dụng helper functions** trong controller/service để check roles
5. **Import từ barrel export** - `@/middleware` hoặc `@/middleware/guards`

## So sánh

### Trước (Basic)
```typescript
router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN),
  validate(createSchema),
  controller.create
);
```

### Sau (Guards) - Khuyến nghị
```typescript
router.post(
  '/',
  authGuard(),
  adminGuard(),
  validate(createSchema),
  controller.create
);
```

Guards dễ đọc và maintain hơn! ✅
