import { apiClient, apiUpload } from "@/lib/api/client";

export type RecruiterTitle = "OWNER" | "MANAGER" | "HR" | "OTHER";

export type EmployerProfile = {
  id: string;
  profileId: string;
  businessName: string | null;
  organizationType: string | null;
  taxCode: string | null;
  recruiterName: string | null;
  recruiterTitle: RecruiterTitle | null;
  recruiterTitleOther: string | null;
  recruiterTitleLabel: string | null;
  address: string | null;
  provinceId: string | null;
  districtId: string | null;
  wardId: string | null;
  coordinates: { lat: number; lng: number } | null;
  contactPhone: string | null;
  contactEmail: string | null;
  contactEmailVerified: boolean;
  contactEmailVerifiedAt: string | null;
  logo: string | null;
  defaultOrganizationId: string | null;
  setupCompletedAt: string | null;
  isComplete: boolean;
  createdAt: string;
};

export type UpdateEmployerProfilePayload = {
  businessName: string;
  organizationType: string;
  taxCode?: string;
  recruiterName: string;
  recruiterTitle?: RecruiterTitle;
  recruiterTitleOther?: string;
  address: string;
  provinceId: string;
  districtId: string;
  wardId: string;
  coordinates: { lat: number; lng: number };
  contactPhone: string;
  contactEmail: string;
};

export const employerApi = {
  createProfile() {
    return apiClient<EmployerProfile>("/employer/profile/", {
      method: "POST",
      body: JSON.stringify({}),
    });
  },

  getProfile() {
    return apiClient<EmployerProfile>("/employer/profile/");
  },

  updateProfile(payload: UpdateEmployerProfilePayload) {
    return apiClient<EmployerProfile>("/employer/profile/", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  sendEmailOtp(email: string) {
    return apiClient<{
      autoVerified: boolean;
      message: string;
      profile?: EmployerProfile;
    }>("/employer/profile/send-email-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  verifyEmailOtp(email: string, otp: string) {
    return apiClient<{
      message: string;
      profile: EmployerProfile;
    }>("/employer/profile/verify-email", {
      method: "POST",
      body: JSON.stringify({ email, otp }),
    });
  },

  uploadLogo(file: File) {
    const form = new FormData();
    form.append("logo", file);
    return apiUpload<{ logo: string; profile: EmployerProfile }>(
      "/employer/profile/logo",
      form,
    );
  },
};
