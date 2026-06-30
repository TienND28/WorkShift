import { Industry } from "../organization/industry/industry.model.js";
import { Position } from "../recruitment/job/position/position.model.js";

export class CatalogService {
  async listIndustries() {
    const items = await Industry.find({ isActive: true, isDeleted: false })
      .sort({ name: 1 })
      .lean();
    return items.map((i) => ({
      id: i._id.toString(),
      code: i.code,
      name: i.name,
    }));
  }

  async listPositions(industryId?: string) {
    const filter: Record<string, unknown> = { isActive: { $ne: false } };
    if (industryId) {
      filter.industryId = industryId;
    }

    const items = await Position.find(filter)
      .populate("industryId", "code name")
      .sort({ name: 1 })
      .lean();

    return items.map((p) => {
      const industry = p.industryId as unknown as {
        _id?: { toString(): string };
        code?: string;
        name?: string;
      } | null;

      return {
        id: p._id.toString(),
        code: p.code,
        name: p.name,
        industry:
          industry && typeof industry === "object" && industry._id
            ? {
                id: industry._id.toString(),
                code: industry.code,
                name: industry.name,
              }
            : null,
      };
    });
  }
}

export const catalogService = new CatalogService();
