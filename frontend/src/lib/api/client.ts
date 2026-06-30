import type { ApiResponse } from "@/types/auth.types";
import { tokenStorage } from "@/lib/auth/storage";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

type RequestOptions = RequestInit & { skipAuth?: boolean };

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenStorage.getRefresh();
  if (!refreshToken) return null;

  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) return null;

  const json = (await res.json()) as ApiResponse<{
    accessToken: string;
    refreshToken: string;
  }>;

  tokenStorage.setTokens({
    accessToken: json.data.accessToken,
    refreshToken: json.data.refreshToken,
  });

  return json.data.accessToken;
}

export async function apiClient<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { skipAuth, headers, ...rest } = options;

  const buildHeaders = (accessToken?: string | null): HeadersInit => ({
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...headers,
  });

  let accessToken = skipAuth ? null : tokenStorage.getAccess();

  let response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: buildHeaders(accessToken),
  });

  if (response.status === 401 && !skipAuth) {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }

    accessToken = await refreshPromise;
    if (accessToken) {
      response = await fetch(`${API_BASE}${path}`, {
        ...rest,
        headers: buildHeaders(accessToken),
      });
    }
  }

  const json = (await response.json()) as ApiResponse<T> & {
    message?: string;
  };

  if (!response.ok) {
    const err = new Error(json.message || "Request failed") as Error & {
      status: number;
    };
    err.status = response.status;
    throw err;
  }

  return json.data;
}

export async function apiUpload<T>(
  path: string,
  formData: FormData,
): Promise<T> {
  let accessToken = tokenStorage.getAccess();

  const doUpload = (token: string | null) =>
    fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

  let response = await doUpload(accessToken);

  if (response.status === 401) {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }
    accessToken = await refreshPromise;
    if (accessToken) {
      response = await doUpload(accessToken);
    }
  }

  const json = (await response.json()) as ApiResponse<T> & {
    message?: string;
  };

  if (!response.ok) {
    const err = new Error(json.message || "Upload failed") as Error & {
      status: number;
    };
    err.status = response.status;
    throw err;
  }

  return json.data;
}
