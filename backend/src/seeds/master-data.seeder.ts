import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { connectDB } from "../config/database.js";
import { Province } from "../modules/location/province.model.js";
import { District } from "../modules/location/district.model.js";
import { Ward } from "../modules/location/ward.model.js";
import { Industry } from "../modules/organization/industry/industry.model.js";
import { Position } from "../modules/recruitment/job/position/position.model.js";
import { INDUSTRIES_AND_POSITIONS } from "./data/industries-positions.js";
import type { VnLocationsDataset } from "./fetch-vn-locations.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCATIONS_FILE = path.join(
  __dirname,
  "data",
  "vn-locations-pre-merger.json",
);

const BATCH_SIZE = 500;

export type SeedOptions = {
  locations?: boolean;
  industries?: boolean;
  positions?: boolean;
  clearLocations?: boolean;
  clearCatalog?: boolean;
};

async function loadLocationsDataset(): Promise<VnLocationsDataset> {
  try {
    const raw = await fs.readFile(LOCATIONS_FILE, "utf-8");
    return JSON.parse(raw) as VnLocationsDataset;
  } catch {
    throw new Error(
      `Missing ${LOCATIONS_FILE}\nRun: npm run seed:fetch`,
    );
  }
}

export async function clearLocations() {
  const [w, d, p] = await Promise.all([
    Ward.deleteMany({}),
    District.deleteMany({}),
    Province.deleteMany({}),
  ]);
  console.log(
    `🗑️  Cleared locations: ${p.deletedCount} provinces, ${d.deletedCount} districts, ${w.deletedCount} wards`,
  );
}

export async function clearIndustryCatalog() {
  const [pos, ind] = await Promise.all([
    Position.deleteMany({}),
    Industry.deleteMany({}),
  ]);
  console.log(
    `🗑️  Cleared catalog: ${ind.deletedCount} industries, ${pos.deletedCount} positions`,
  );
}

export async function seedLocations(clearFirst = false) {
  const dataset = await loadLocationsDataset();

  if (clearFirst) {
    await clearLocations();
  }

  console.log(
    `📍 Importing locations (${dataset.version}, ${dataset.provinceCount} provinces)...`,
  );

  let totalDistricts = 0;
  let totalWards = 0;

  for (const prov of dataset.provinces) {
    const provinceDoc = await Province.findOneAndUpdate(
      { code: prov.code },
      { code: prov.code, name: prov.name },
      { upsert: true, new: true },
    );

    for (const dist of prov.districts) {
      const districtDoc = await District.findOneAndUpdate(
        { code: dist.code },
        {
          code: dist.code,
          name: dist.name,
          provinceId: provinceDoc._id,
        },
        { upsert: true, new: true },
      );

      totalDistricts += 1;

      const wardOps = dist.wards.map((ward) => ({
        updateOne: {
          filter: { code: ward.code },
          update: {
            $set: {
              code: ward.code,
              name: ward.name,
              districtId: districtDoc._id,
            },
          },
          upsert: true,
        },
      }));

      for (let i = 0; i < wardOps.length; i += BATCH_SIZE) {
        const chunk = wardOps.slice(i, i + BATCH_SIZE);
        if (chunk.length > 0) {
          await Ward.bulkWrite(chunk);
        }
      }

      totalWards += dist.wards.length;
    }

    console.log(
      `   ✅ ${prov.name} (${prov.districts.length} districts)`,
    );
  }

  console.log(
    `📍 Locations done: ${dataset.provinceCount} provinces, ${totalDistricts} districts, ${totalWards} wards`,
  );
}

export async function seedIndustries(clearFirst = false) {
  if (clearFirst) {
    await Industry.deleteMany({});
  }

  console.log(`🏭 Importing ${INDUSTRIES_AND_POSITIONS.length} industries...`);

  for (const item of INDUSTRIES_AND_POSITIONS) {
    await Industry.findOneAndUpdate(
      { code: item.code },
      {
        code: item.code,
        name: item.name,
        isActive: true,
        isDeleted: false,
      },
      { upsert: true, new: true },
    );
  }

  const count = await Industry.countDocuments({ isDeleted: false });
  console.log(`🏭 Industries done: ${count} records`);
}

export async function seedPositions(clearFirst = false) {
  if (clearFirst) {
    await Position.deleteMany({});
  }

  let total = 0;

  console.log("💼 Importing positions...");

  for (const item of INDUSTRIES_AND_POSITIONS) {
    const industry = await Industry.findOne({ code: item.code });
    if (!industry) {
      console.warn(`   ⚠️  Skip positions — industry not found: ${item.code}`);
      continue;
    }

    for (const pos of item.positions) {
      await Position.findOneAndUpdate(
        { code: pos.code },
        {
          code: pos.code,
          name: pos.name,
          industryId: industry._id,
          isActive: true,
        },
        { upsert: true, new: true },
      );
      total += 1;
    }
  }

  console.log(`💼 Positions done: ${total} records`);
}

export async function seedMasterData(options: SeedOptions = {}) {
  const {
    locations = true,
    industries = true,
    positions = true,
    clearLocations = false,
    clearCatalog = false,
  } = options;

  if (mongoose.connection.readyState === 0) {
    await connectDB();
  }

  if (clearCatalog && (industries || positions)) {
    await clearIndustryCatalog();
  }

  if (industries) {
    await seedIndustries(clearCatalog);
  }

  if (positions) {
    await seedPositions(clearCatalog && !industries);
  }

  if (locations) {
    await seedLocations(clearLocations);
  }

  console.log("\n🎉 Master data seed completed.");
}
