import { ApiMessages } from "../../../constants/index.js";
import { ConflictError, NotFoundError } from "../../../utils/index.js";
import { Industry } from "./industry.model.js";
import { CreateIndustryInput, UpdateIndustryInput } from "./industry.schema.js";
import { UserRole } from "../../user/user.schema.js";

export class IndustryService {
  static async create(data: CreateIndustryInput) {
    const exists = await Industry.findOne({ code: data.code });
    if (exists) throw new ConflictError("Industry already exists");

    return Industry.create(data);
  }

  static async getActive() {
    return Industry.find({ isActive: true, isDeleted: false }).sort({
      code: 1,
    });
  }

  static async getAll() {
    return Industry.find({ isDeleted: false }).sort({ code: 1 });
  }

  static async getById(id: string, role?: string) {
    const query: any = { _id: id, isDeleted: false };

    // Only Admin can see inactive industries
    if (role !== UserRole.ADMIN) {
      query.isActive = true;
    }

    const industry = await Industry.findOne(query);
    if (!industry) throw new NotFoundError(ApiMessages.NOT_FOUND);
    return industry;
  }

  static async update(id: string, data: UpdateIndustryInput) {
    const industry = await Industry.findOneAndUpdate(
      { _id: id, isDeleted: false },
      data,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!industry) throw new NotFoundError(ApiMessages.NOT_FOUND);
    return industry;
  }

  static async delete(id: string) {
    // Soft delete
    const industry = await Industry.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );

    if (!industry) throw new NotFoundError(ApiMessages.NOT_FOUND);

    return true;
  }
}
