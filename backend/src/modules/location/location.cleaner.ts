import mongoose from "mongoose";
import { Province } from "./province.model.js";
import { District } from "./district.model.js";
import { Ward } from "./ward.model.js";
import { connectDB } from "../../config/database.js";
import dotenv from "dotenv";

dotenv.config();

export async function clearAllLocations() {
  try {
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }

    console.log("🗑️  Starting to clear location data...");

    // Delete in order: Wards -> Districts -> Provinces
    const deletedWards = await Ward.deleteMany({});
    console.log(`✅ Deleted ${deletedWards.deletedCount} wards`);

    const deletedDistricts = await District.deleteMany({});
    console.log(`✅ Deleted ${deletedDistricts.deletedCount} districts`);

    const deletedProvinces = await Province.deleteMany({});
    console.log(`✅ Deleted ${deletedProvinces.deletedCount} provinces`);

    console.log("\n🎉 Successfully cleared all location data!");
  } catch (error) {
    console.error("❌ Error clearing data:", error);
    if (error instanceof Error) {
      console.error("Details:", error.message);
    }
    process.exit(1);
  }
}

// Check if this module is being run directly
if (require.main === module) {
  clearAllLocations().then(() => {
    console.log("🔌 Database connection handled.");
    process.exit(0);
  });
}
