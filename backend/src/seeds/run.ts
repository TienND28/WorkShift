/**
 * CLI seed — fetch dữ liệu VN + import MongoDB
 *
 * npm run seed:fetch          # tải JSON tỉnh/huyện/xã (63 tỉnh, trước sáp nhập)
 * npm run seed                # import tất cả (cần đã fetch locations)
 * npm run seed -- --clear     # xóa rồi import lại
 * npm run seed -- --only=locations|industries|positions
 */
import mongoose from "mongoose";
import { fetchVnLocationsDataset } from "./fetch-vn-locations.js";
import { seedMasterData, type SeedOptions } from "./master-data.seeder.js";

const args = process.argv.slice(2);

const hasFlag = (flag: string) => args.includes(flag);

const parseOnly = (): SeedOptions | null => {
  const onlyArg = args.find((a) => a.startsWith("--only="));
  if (!onlyArg) return null;

  const value = onlyArg.split("=")[1];
  const base: SeedOptions = {
    locations: false,
    industries: false,
    positions: false,
  };

  if (value === "locations") return { ...base, locations: true };
  if (value === "industries") return { ...base, industries: true };
  if (value === "positions") return { ...base, positions: true };
  if (value === "catalog") {
    return { ...base, industries: true, positions: true };
  }

  throw new Error(
    `Unknown --only value: ${value}. Use locations|industries|positions|catalog`,
  );
};

async function main() {
  if (hasFlag("--fetch")) {
    await fetchVnLocationsDataset();
    if (!hasFlag("--import")) {
      return;
    }
  }

  const only = parseOnly();
  const clear = hasFlag("--clear");

  await seedMasterData({
    locations: only?.locations ?? !only,
    industries: only?.industries ?? !only,
    positions: only?.positions ?? !only,
    clearLocations: clear && (only?.locations ?? !only),
    clearCatalog:
      clear && (only?.industries || only?.positions || !only),
  });
}

main()
  .then(async () => {
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error("❌ Seed failed:", err);
    await mongoose.disconnect().catch(() => undefined);
    process.exit(1);
  });
