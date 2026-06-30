export interface ResponseMeta {
  timestamp: string;
  requestId?: string;
  path?: string;
}

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  statusCode: number;
  message?: string;
  data?: T;
  meta: ResponseMeta;
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  errors?: unknown;
  meta: ResponseMeta;
  stack?: string;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiPaginatedResponse<T = unknown> extends ApiSuccessResponse<T[]> {
  pagination: PaginationMeta;
}
