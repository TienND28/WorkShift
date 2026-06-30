import { apiClient } from "@/lib/api/client";

export type GenderRequirement = "MALE" | "FEMALE" | "OTHER" | "ANY";
export type JobPostingStatus = "DRAFT" | "PUBLISHED" | "CLOSED" | "EXPIRED";

export type CreateJobPostingPayload = {
  title: string;
  description?: string;
  location?: {
    provinceId?: string;
    districtId?: string;
    wardId?: string;
    address?: string;
  };
  requirements?: string;
  benefits?: string;
  deadline?: string;
};

export type JobPosting = {
  id: string;
  organizationId: string;
  posterId: string;
  title: string;
  description: string | null;
  location: CreateJobPostingPayload["location"];
  requirements: string | null;
  benefits: string | null;
  deadline: string | null;
  status: JobPostingStatus;
  publishedAt: string | null;
  closedAt: string | null;
  viewCount: number;
  applicationCount: number;
  createdAt: string;
  updatedAt: string;
};

export type PostingJob = {
  id: string;
  jobPostingId: string;
  positionId: string;
  position: { id?: string; code?: string; name?: string } | null;
  title: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
};

export type AddJobsPayload = {
  jobs: Array<{
    positionId: string;
    title: string;
    description?: string;
    sortOrder?: number;
  }>;
};

export type CreateShiftTemplatePayload = {
  name?: string;
  weekdays: number[];
  startTime: string;
  endTime: string;
  salary: number;
  slotsPerShift: number;
  genderRequirement: GenderRequirement;
  effectiveFrom: string;
  effectiveTo: string;
};

export type ShiftTemplate = CreateShiftTemplatePayload & {
  id: string;
  jobId: string;
  isActive: boolean;
};

export const jobPostingApi = {
  create(organizationId: string, payload: CreateJobPostingPayload) {
    return apiClient<JobPosting>(
      `/organizations/${organizationId}/job-postings`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
  },

  addJobs(organizationId: string, postingId: string, payload: AddJobsPayload) {
    return apiClient<PostingJob[]>(
      `/organizations/${organizationId}/job-postings/${postingId}/jobs`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
  },

  createShiftTemplate(
    organizationId: string,
    postingId: string,
    jobId: string,
    payload: CreateShiftTemplatePayload,
  ) {
    return apiClient<ShiftTemplate>(
      `/organizations/${organizationId}/job-postings/${postingId}/jobs/${jobId}/shift-templates`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
  },

  generateShiftDates(
    organizationId: string,
    postingId: string,
    jobId: string,
    templateId: string,
    autoGenerateSlots = true,
  ) {
    return apiClient<{
      generated: number;
      created: number;
      updated: number;
      autoGenerateSlots: boolean;
    }>(
      `/organizations/${organizationId}/job-postings/${postingId}/jobs/${jobId}/shift-templates/${templateId}/dates/generate`,
      {
        method: "POST",
        body: JSON.stringify({ autoGenerateSlots }),
      },
    );
  },

  publish(organizationId: string, postingId: string) {
    return apiClient<JobPosting>(
      `/organizations/${organizationId}/job-postings/${postingId}/publish`,
      { method: "POST" },
    );
  },
};
