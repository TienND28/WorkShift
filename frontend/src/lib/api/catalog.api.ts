import { apiClient } from "@/lib/api/client";

export type CatalogItem = { id: string; code: string; name: string };

export type PositionItem = CatalogItem & {
  industry: { id: string; code?: string; name?: string } | null;
};

export const catalogApi = {
  getIndustries() {
    return apiClient<CatalogItem[]>("/catalog/industries", { skipAuth: true });
  },

  getPositions(industryId?: string) {
    const query = industryId
      ? `?industryId=${encodeURIComponent(industryId)}`
      : "";
    return apiClient<PositionItem[]>(`/catalog/positions${query}`, {
      skipAuth: true,
    });
  },

  getProvinces() {
    return apiClient<CatalogItem[]>("/locations/provinces", { skipAuth: true });
  },

  getDistricts(provinceId: string) {
    return apiClient<CatalogItem[]>(
      `/locations/provinces/${provinceId}/districts`,
      { skipAuth: true },
    );
  },

  getWards(districtId: string) {
    return apiClient<CatalogItem[]>(
      `/locations/districts/${districtId}/wards`,
      { skipAuth: true },
    );
  },
};
