import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "../../config/database.js";
import { clearLocations } from "../../seeds/master-data.seeder.js";

export async function clearAllLocations() {
  if (mongoose.connection.readyState === 0) {
    await connectDB();
  }
  await clearLocations();
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  clearAllLocations()
    .then(async () => {
      await mongoose.disconnect();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error("❌ Error clearing data:", err);
      await mongoose.disconnect().catch(() => undefined);
      process.exit(1);
    });
}
