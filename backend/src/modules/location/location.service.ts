import { Province } from "./province.model.js";
import { District } from "./district.model.js";
import { Ward } from "./ward.model.js";
import { NotFoundError } from "../../utils/errors.js";

const formatItem = (doc: { _id: { toString(): string }; code: string; name: string }) => ({
  id: doc._id.toString(),
  code: doc.code,
  name: doc.name,
});

export class LocationService {
  async listProvinces() {
    const items = await Province.find().sort({ name: 1 }).lean();
    return items.map(formatItem);
  }

  async listDistrictsByProvince(provinceId: string) {
    const province = await Province.findById(provinceId);
    if (!province) {
      throw new NotFoundError("Province not found");
    }
    const items = await District.find({ provinceId }).sort({ name: 1 }).lean();
    return items.map(formatItem);
  }

  async listWardsByDistrict(districtId: string) {
    const district = await District.findById(districtId);
    if (!district) {
      throw new NotFoundError("District not found");
    }
    const items = await Ward.find({ districtId }).sort({ name: 1 }).lean();
    return items.map(formatItem);
  }
}

export const locationService = new LocationService();
