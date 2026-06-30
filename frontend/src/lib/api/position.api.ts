import { apiClient } from "@/lib/api/client";

export type Position = {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
  industry: { id: string; code?: string; name?: string } | null;
};

type RawIndustryRef = {
  _id?: string;
  id?: string;
  code?: string;
  name?: string;
};

type RawPosition = {
  _id?: string;
  id?: string;
  code: string;
  name: string;
  isActive?: boolean;
  industryId?: RawIndustryRef | string;
};

function normalizeIndustryRef(ref: RawIndustryRef | string | undefined) {
  if (!ref || typeof ref === "string") {
    return ref ? { id: ref } : null;
  }
  return {
    id: String(ref._id ?? ref.id),
    code: ref.code,
    name: ref.name,
  };
}

function normalizePosition(raw: RawPosition): Position {
  return {
    id: String(raw._id ?? raw.id),
    code: raw.code,
    name: raw.name,
    isActive: raw.isActive ?? true,
    industry: normalizeIndustryRef(raw.industryId),
  };
}

export type CreatePositionPayload = {
  code: string;
  name: string;
  industryId: string;
};

export type UpdatePositionPayload = {
  name?: string;
  industryId?: string;
  isActive?: boolean;
};

export const positionApi = {
  listAll(industryId?: string) {
    const qs = industryId ? `?industryId=${industryId}` : "";
    return apiClient<RawPosition[]>(`/positions/admin/all${qs}`).then((items) =>
      items.map(normalizePosition),
    );
  },

  create(payload: CreatePositionPayload) {
    return apiClient<RawPosition>("/positions", {
      method: "POST",
      body: JSON.stringify(payload),
    }).then(normalizePosition);
  },

  update(id: string, payload: UpdatePositionPayload) {
    return apiClient<RawPosition>(`/positions/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }).then(normalizePosition);
  },

  remove(id: string) {
    return apiClient<unknown>(`/positions/${id}`, { method: "DELETE" });
  },
};
