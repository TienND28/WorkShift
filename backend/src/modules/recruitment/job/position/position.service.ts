import { ApiMessages } from "../../../../constants/index.js";
import { ConflictError, NotFoundError } from "../../../../utils/index.js";
import { Industry } from "../../../organization/industry/industry.model.js";
import { Position } from "./position.model.js";
import type { CreatePositionInput, UpdatePositionInput } from "./position.schema.js";

export class PositionService {
  static async create(data: CreatePositionInput) {
    const exists = await Position.findOne({ code: data.code });
    if (exists) throw new ConflictError("Position already exists");

    const industry = await Industry.findOne({
      _id: data.industryId,
      isDeleted: false,
      isActive: true,
    });
    if (!industry) throw new NotFoundError("Industry not found");

    return Position.create({
      code: data.code.toLowerCase(),
      name: data.name,
      industryId: data.industryId,
    });
  }

  static async getActive(industryId?: string) {
    const query: Record<string, unknown> = { isActive: { $ne: false } };
    if (industryId) query.industryId = industryId;

    return Position.find(query)
      .populate("industryId", "code name")
      .sort({ name: 1 });
  }

  static async getAll(industryId?: string) {
    const query: Record<string, unknown> = {};
    if (industryId) query.industryId = industryId;

    return Position.find(query)
      .populate("industryId", "code name")
      .sort({ name: 1 });
  }

  static async getById(id: string) {
    const position = await Position.findById(id).populate(
      "industryId",
      "code name",
    );
    if (!position) throw new NotFoundError(ApiMessages.NOT_FOUND);
    return position;
  }

  static async update(id: string, data: UpdatePositionInput) {
    if (data.industryId) {
      const industry = await Industry.findOne({
        _id: data.industryId,
        isDeleted: false,
        isActive: true,
      });
      if (!industry) throw new NotFoundError("Industry not found");
    }

    const position = await Position.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).populate("industryId", "code name");

    if (!position) throw new NotFoundError(ApiMessages.NOT_FOUND);
    return position;
  }

  static async delete(id: string) {
    const position = await Position.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true },
    );
    if (!position) throw new NotFoundError(ApiMessages.NOT_FOUND);
    return true;
  }
}
