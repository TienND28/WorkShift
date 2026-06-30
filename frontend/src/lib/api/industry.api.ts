import { apiClient } from "@/lib/api/client";

export type Industry = {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
};

type RawIndustry = {
  _id?: string;
  id?: string;
  code: string;
  name: string;
  isActive?: boolean;
};

function normalizeIndustry(raw: RawIndustry): Industry {
  return {
    id: String(raw._id ?? raw.id),
    code: raw.code,
    name: raw.name,
    isActive: raw.isActive ?? true,
  };
}

export type CreateIndustryPayload = { code: string; name: string };
export type UpdateIndustryPayload = { name?: string; isActive?: boolean };

export const industryApi = {
  listAll() {
    return apiClient<RawIndustry[]>("/industries/admin/all").then((items) =>
      items.map(normalizeIndustry),
    );
  },

  create(payload: CreateIndustryPayload) {
    return apiClient<RawIndustry>("/industries", {
      method: "POST",
      body: JSON.stringify(payload),
    }).then(normalizeIndustry);
  },

  update(id: string, payload: UpdateIndustryPayload) {
    return apiClient<RawIndustry>(`/industries/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }).then(normalizeIndustry);
  },

  remove(id: string) {
    return apiClient<unknown>(`/industries/${id}`, { method: "DELETE" });
  },
};
