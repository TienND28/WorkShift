export type ProfileType = "WORKER" | "EMPLOYER";

export type OnboardingStage =
  | "role"
  | "worker_setup"
  | "employer_setup"
  | "complete";

export interface OnboardingStatus {
  needsOnboarding: boolean;
  stage: OnboardingStage;
  profileType?: ProfileType;
}

export interface AuthUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  phone?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  profileTypes: ProfileType[];
  status: string;
  isSystemAdmin: boolean;
  lastLoginAt?: string;
  createdAt: string;
  onboarding: OnboardingStatus;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface GoogleAuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}
