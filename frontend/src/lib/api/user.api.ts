import type { AuthUser } from "@/types/auth.types";
import { apiClient, apiUpload } from "@/lib/api/client";

export type UpdateUserPayload = {
  fullName?: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: string;
};

export const userApi = {
  updateMe(payload: UpdateUserPayload) {
    return apiClient<AuthUser>("/users/me", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  uploadAvatar(file: File) {
    const form = new FormData();
    form.append("avatar", file);
    return apiUpload<AuthUser>("/users/me/avatar", form);
  },
};
