import { apiClient } from "@/lib/api/client";
import type {
  AuthUser,
  GoogleAuthResponse,
  ProfileType,
} from "@/types/auth.types";

export const authApi = {
  googleLogin(idToken: string): Promise<GoogleAuthResponse> {
    return apiClient<GoogleAuthResponse>("/auth/google", {
      method: "POST",
      body: JSON.stringify({ idToken }),
      skipAuth: true,
    });
  },

  getMe(): Promise<AuthUser> {
    return apiClient<AuthUser>("/auth/me");
  },

  selectProfileType(profileType: ProfileType): Promise<GoogleAuthResponse> {
    return apiClient<GoogleAuthResponse>("/auth/select-profile-type", {
      method: "POST",
      body: JSON.stringify({ profileType }),
    });
  },

  requestEmailLogin(email: string): Promise<{
    message: string;
    devMagicLink?: string;
  }> {
    return apiClient("/auth/email/request", {
      method: "POST",
      body: JSON.stringify({ email }),
      skipAuth: true,
    });
  },

  verifyEmailLogin(token: string): Promise<GoogleAuthResponse> {
    return apiClient<GoogleAuthResponse>("/auth/email/verify", {
      method: "POST",
      body: JSON.stringify({ token }),
      skipAuth: true,
    });
  },

  logout(refreshToken: string | null): Promise<null> {
    return apiClient<null>("/auth/logout", {
      method: "POST",
      body: JSON.stringify(
        refreshToken ? { refreshToken } : {},
      ),
    });
  },
};
