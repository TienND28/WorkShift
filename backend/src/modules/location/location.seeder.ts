import axios from "axios";
import mongoose from "mongoose";
import { connectDB } from "../../config/database.js";
import { Province } from "./province.model.js";
import { District } from "./district.model.js";
import { Ward } from "./ward.model.js";
import { clearAllLocations } from "./location.cleaner.js";
import dotenv from "dotenv";

// Load environment variables if running standalone
dotenv.config();

const API_URL = "https://provinces.open-api.vn/api/?depth=3";

interface WardData {
  code: number | string;
  name: string;
}

interface DistrictData {
  code: number | string;
  name: string;
  wards: WardData[];
}

interface ProvinceData {
  code: number | string;
  name: string;
  districts: DistrictData[];
}

export async function importAllLocations(shouldClear = false) {
  try {
    // Ensure DB is connected if not already
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }

    if (shouldClear) {
      await clearAllLocations();
    }

    console.log("Fetching data from API...");
    const response = await axios.get<ProvinceData[]>(API_URL);
    const provincesData = response.data;

    console.log(`📊 Found ${provincesData.length} provinces.`);

    let totalProvinces = 0;
    let totalDistricts = 0;
    let totalWards = 0;

    for (const prov of provincesData) {
      // ──────────────── 1. Province ────────────────
      const provinceDoc = await Province.findOneAndUpdate(
        { code: String(prov.code) },
        { name: prov.name, code: String(prov.code) },
        { upsert: true, new: true }
      );

      totalProvinces++;

      // ──────────────── 2. Districts ────────────────
      for (const dist of prov.districts || []) {
        const districtDoc = await District.findOneAndUpdate(
          { code: String(dist.code) },
          {
            name: dist.name,
            code: String(dist.code),
            provinceId: provinceDoc._id,
          },
          { upsert: true, new: true }
        );

        totalDistricts++;

        // ──────────────── 3. Wards ────────────────
        // Batch upsert or sequential? Sequential is safer for now to avoid complexity,
        // though slower. API depth=3 return shouldn't be too huge (63 provinces).
        // Using Promise.all for wards might speed it up significantly.

        const wardOperations = (dist.wards || []).map((ward) => ({
          updateOne: {
            filter: { code: String(ward.code) },
            update: {
              $set: {
                name: ward.name,
                code: String(ward.code),
                districtId: districtDoc._id,
              },
            },
            upsert: true,
          },
        }));

        if (wardOperations.length > 0) {
          await Ward.bulkWrite(wardOperations);
          totalWards += wardOperations.length;
        }
      }

      console.log(
        `✅ Imported: ${prov.name} (${prov.districts?.length || 0} districts)`
      );
    }

    console.log("\n🎉 Import completed successfully!");
    console.log(`📊 Summary:`);
    console.log(`   - Provinces: ${totalProvinces}`);
    console.log(`   - Districts: ${totalDistricts}`);
    console.log(`   - Wards: ${totalWards}`);
  } catch (error) {
    console.error("❌ Error importing locations:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }
    process.exit(1);
  } finally {
    // Only disconnect if invoked as a standalone script logic would handle it,
    // but since this function might be used in other places, we shouldn't forcibly disconnect
    // unless we know we are done-done.
    // However, for the purpose of the "import script", we usually want to exit.
    // I'll leave connection open if imported, close if standalone?
    // For now, I'll match the user's intent: run and done.
    // But `process.exit(0)` is better than disconnect if we want to end the process.
  }
}

// Check if this module is being run directly
if (require.main === module) {
  importAllLocations().then(() => {
    console.log("🔌 Finished.");
    process.exit(0);
  });
}
