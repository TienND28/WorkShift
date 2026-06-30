import { apiClient, apiUpload } from "@/lib/api/client";

export type Organization = {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  organizationType: { id: string; code?: string; name?: string };
  address: string;
  provinceId: string;
  districtId: string;
  wardId: string;
  contactPhone: string;
  email: string;
  website: string | null;
  taxCode: string | null;
  verificationLevel: number;
  verificationStatus: string;
  myRole?: string;
};

export type CreateOrganizationPayload = {
  name: string;
  organizationType: string;
  address: string;
  provinceId: string;
  districtId: string;
  wardId: string;
  contactPhone: string;
  email: string;
  description?: string;
  taxCode?: string;
  verificationLevel?: 1 | 2;
};

export type UpdateOrganizationPayload = Partial<CreateOrganizationPayload>;

export const organizationApi = {
  listMine() {
    return apiClient<Organization[]>("/organizations/");
  },

  getById(organizationId: string) {
    return apiClient<Organization>(`/organizations/${organizationId}`);
  },

  create(payload: CreateOrganizationPayload) {
    return apiClient<Organization>("/organizations/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  update(organizationId: string, payload: UpdateOrganizationPayload) {
    return apiClient<Organization>(`/organizations/${organizationId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  uploadLogo(organizationId: string, file: File) {
    const form = new FormData();
    form.append("logo", file);
    return apiUpload<{ logo: string }>(
      `/organizations/${organizationId}/logo`,
      form,
    );
  },
};
