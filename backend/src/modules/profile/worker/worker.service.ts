import mongoose from "mongoose";

import { ProfileType } from "../../../common/enums/index.js";

import { ApiMessages } from "../../../constants/index.js";

import { BadRequestError, NotFoundError } from "../../../utils/errors.js";

import { Industry } from "../../organization/industry/industry.model.js";

import { District } from "../../location/district.model.js";

import { Position } from "../../recruitment/job/position/position.model.js";

import {

  UserProfile,

  WorkerProfile,

  type IWorkerProfile,

} from "../models/index.js";

import { profileService } from "../profile.service.js";
import {
  getWorkerProfileLimits,
  resolveWorkerMembershipTier,
} from "../../../config/workerProfileLimits.js";
import type {
  CreateWorkerProfileInput,
  UpdateWorkerProfileInput,
} from "./worker.schema.js";



type PopulatedIndustry = { _id: mongoose.Types.ObjectId; code: string; name: string };

type PopulatedPosition = {

  _id: mongoose.Types.ObjectId;

  code: string;

  name: string;

  industryId?: PopulatedIndustry | mongoose.Types.ObjectId;

};

type PopulatedDistrict = { _id: mongoose.Types.ObjectId; code: string; name: string };



const formatIndustryRef = (industry: PopulatedIndustry | mongoose.Types.ObjectId | undefined) => {

  if (industry && typeof industry === "object" && "code" in industry) {

    return { id: industry._id.toString(), code: industry.code, name: industry.name };

  }

  if (industry) {

    return { id: String(industry) };

  }

  return null;

};



const formatWorkerProfile = (doc: IWorkerProfile) => {

  const industries = (doc.preferredIndustryIds ?? []) as unknown as PopulatedIndustry[];

  const positions = (doc.preferredPositionIds ?? []) as unknown as PopulatedPosition[];

  const districts = (doc.preferredDistrictIds ?? []) as unknown as PopulatedDistrict[];



  const preferredPositions = positions.map((p) => {
    const industry = formatIndustryRef(
      p && typeof p === "object" && "industryId" in p ? p.industryId : undefined,
    );
    return p && typeof p === "object" && "code" in p
      ? { id: p._id.toString(), code: p.code, name: p.name, industry }
      : { id: String(p), industry: null };
  });

  let preferredIndustries = industries.map((i) =>
    i && typeof i === "object" && "code" in i
      ? { id: i._id.toString(), code: i.code, name: i.name }
      : { id: String(i) },
  );

  if (preferredIndustries.length === 0) {
    const seen = new Set<string>();
    for (const position of preferredPositions) {
      const industry = position.industry;
      if (industry?.id && !seen.has(industry.id)) {
        seen.add(industry.id);
        preferredIndustries.push(industry);
      }
    }
  }

  return {
    id: doc._id.toString(),
    profileId: doc.profileId.toString(),
    bio: doc.bio ?? null,
    expectedSalary: doc.expectedSalary ?? null,
    experienceYears: doc.experienceYears ?? 0,
    ratingAvg: doc.ratingAvg ?? 0,
    completedShifts: doc.completedShifts ?? 0,
    noShowCount: doc.noShowCount ?? 0,
    preferredIndustries,
    preferredPositions,

    preferredLocations: districts.map((d) =>

      d && typeof d === "object" && "code" in d

        ? { id: d._id.toString(), code: d.code, name: d.name }

        : { id: String(d) },

    ),

    availabilities: doc.availabilities ?? [],

    createdAt: doc.createdAt,

    updatedAt: doc.updatedAt,

  };

};



const populateWorkerProfile = (profileId: mongoose.Types.ObjectId) =>

  WorkerProfile.findOne({ profileId })

    .populate("preferredIndustryIds", "code name")

    .populate({

      path: "preferredPositionIds",

      select: "code name industryId",

      populate: { path: "industryId", select: "code name" },

    })

    .populate("preferredDistrictIds", "code name");



async function deriveIndustryIdsFromPositions(

  positionIds: string[],

): Promise<string[]> {

  if (!positionIds.length) return [];



  const positions = await Position.find({ _id: { $in: positionIds } })

    .select("industryId")

    .lean();



  return [

    ...new Set(

      positions.map((p) => p.industryId.toString()).filter(Boolean),

    ),

  ];

}



async function validatePreferredReferences(

  industryIds?: string[],

  positionIds?: string[],

  districtIds?: string[],

) {

  if (industryIds?.length) {

    const uniqueIds = [...new Set(industryIds)];

    const count = await Industry.countDocuments({

      _id: { $in: uniqueIds },

      isActive: { $ne: false },

      isDeleted: { $ne: true },

    });

    if (count !== uniqueIds.length) {

      throw new BadRequestError("One or more preferred industries are invalid");

    }

  }



  if (positionIds?.length) {

    const uniqueIds = [...new Set(positionIds)];

    const count = await Position.countDocuments({

      _id: { $in: uniqueIds },

      isActive: { $ne: false },

    });

    if (count !== uniqueIds.length) {

      throw new BadRequestError("One or more preferred positions are invalid");

    }

  }



  if (districtIds?.length) {

    const uniqueIds = [...new Set(districtIds)];

    const count = await District.countDocuments({ _id: { $in: uniqueIds } });

    if (count !== uniqueIds.length) {

      throw new BadRequestError(

        "One or more preferred locations (districts) are invalid",

      );

    }

  }

}



async function getWorkerProfileOrThrow(userId: string) {

  const userProfile = await UserProfile.findOne({

    userId,

    type: ProfileType.WORKER,

  });



  if (!userProfile) {

    throw new NotFoundError("Worker profile not found");

  }



  const workerProfile = await populateWorkerProfile(userProfile._id);

  if (!workerProfile) {

    throw new NotFoundError("Worker profile details not found");

  }



  return { userProfile, workerProfile };

}



export class WorkerService {

  async createProfile(userId: string, data: CreateWorkerProfileInput = {}) {

    await validatePreferredReferences(

      data.preferredIndustryIds,

      data.preferredPositionIds,

      data.preferredDistrictIds,

    );



    let userProfile = await UserProfile.findOne({

      userId,

      type: ProfileType.WORKER,

    });



    if (!userProfile) {

      userProfile = await profileService.createProfile(

        userId,

        ProfileType.WORKER,

      );

    }



    const updateFields = await buildUpdateFields(data);

    let workerProfile = await populateWorkerProfile(userProfile._id);



    if (!workerProfile) {

      throw new NotFoundError("Worker profile details not found");

    }



    if (Object.keys(updateFields).length > 0) {

      Object.assign(workerProfile, updateFields);

      await workerProfile.save();

      workerProfile = await populateWorkerProfile(userProfile._id);

    }



    if (!workerProfile) {

      throw new NotFoundError("Worker profile details not found");

    }



    return formatWorkerProfile(workerProfile);

  }



  async getProfile(userId: string) {

    const { workerProfile } = await getWorkerProfileOrThrow(userId);

    return formatWorkerProfile(workerProfile);

  }

  getProfileLimits(userId: string) {
    const tier = resolveWorkerMembershipTier(userId);
    return {
      tier,
      limits: getWorkerProfileLimits(tier),
    };
  }

  async updateProfile(userId: string, data: UpdateWorkerProfileInput) {

    await validatePreferredReferences(

      data.preferredIndustryIds,

      data.preferredPositionIds,

      data.preferredDistrictIds,

    );



    const { workerProfile } = await getWorkerProfileOrThrow(userId);

    const updateFields = await buildUpdateFields(data);



    Object.assign(workerProfile, updateFields);

    await workerProfile.save();



    const updated = await populateWorkerProfile(workerProfile.profileId);

    if (!updated) {

      throw new NotFoundError("Worker profile details not found");

    }



    return {

      profile: formatWorkerProfile(updated),

      message: ApiMessages.PROFILE_UPDATED,

    };

  }

}



async function buildUpdateFields(

  data: CreateWorkerProfileInput | UpdateWorkerProfileInput,

) {

  const fields: Record<string, unknown> = {};



  if (data.bio !== undefined) {

    fields.bio = data.bio;

  }

  if (data.expectedSalary !== undefined) {

    fields.expectedSalary = data.expectedSalary;

  }



  if (data.preferredPositionIds !== undefined) {

    fields.preferredPositionIds = data.preferredPositionIds.map(

      (id) => new mongoose.Types.ObjectId(id),

    );



    const derivedIndustryIds =

      data.preferredIndustryIds ??

      (await deriveIndustryIdsFromPositions(data.preferredPositionIds));



    fields.preferredIndustryIds = derivedIndustryIds.map(

      (id) => new mongoose.Types.ObjectId(id),

    );

  } else if (data.preferredIndustryIds !== undefined) {

    fields.preferredIndustryIds = data.preferredIndustryIds.map(

      (id) => new mongoose.Types.ObjectId(id),

    );

  }



  if (data.preferredDistrictIds !== undefined) {

    fields.preferredDistrictIds = data.preferredDistrictIds.map(

      (id) => new mongoose.Types.ObjectId(id),

    );

  }

  if (data.availabilities !== undefined) {

    fields.availabilities = data.availabilities;

  }



  return fields;

}



export const workerService = new WorkerService();

