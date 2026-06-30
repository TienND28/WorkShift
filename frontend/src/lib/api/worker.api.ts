import { apiClient } from "@/lib/api/client";

export type WorkerAvailability = {
  weekday: number;
  startTime: string;
  endTime: string;
};

export type CatalogRef = { id: string; code?: string; name?: string };

export type WorkerProfile = {
  id: string;
  profileId: string;
  bio: string | null;
  expectedSalary: number | null;
  preferredIndustries: CatalogRef[];
  preferredPositions: (CatalogRef & { industry: CatalogRef | null })[];
  preferredLocations: CatalogRef[];
  availabilities: WorkerAvailability[];
};

export type WorkerProfileLimitsResponse = {
  tier: "FREE" | "PREMIUM";
  limits: {
    preferredProvinces: number;
    preferredIndustries: number;
    preferredPositions: number;
    preferredDistricts: number;
    availabilities: number;
  };
};

export type WorkerProfilePayload = {
  bio?: string;
  expectedSalary?: number;
  preferredIndustryIds?: string[];
  preferredPositionIds?: string[];
  preferredDistrictIds?: string[];
  availabilities?: WorkerAvailability[];
};

export const workerApi = {
  getProfileLimits() {
    return apiClient<WorkerProfileLimitsResponse>("/worker/profile/limits");
  },

  getProfile() {
    return apiClient<WorkerProfile>("/worker/profile/");
  },

  createProfile(payload: WorkerProfilePayload = {}) {
    return apiClient<WorkerProfile>("/worker/profile/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateProfile(payload: WorkerProfilePayload) {
    return apiClient<{ profile: WorkerProfile; message: string }>(
      "/worker/profile/",
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    ).then((r) => r.profile);
  },
};
