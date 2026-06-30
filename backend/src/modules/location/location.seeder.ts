/**
 * @deprecated Dùng `src/seeds/` — dữ liệu 63 tỉnh trước sáp nhập (hanhchinhvn).
 * Giữ re-export để không gãy import cũ.
 */
import { seedLocations } from "../../seeds/master-data.seeder.js";

/** @deprecated Use seedLocations from seeds/master-data.seeder */
export async function importAllLocations(shouldClear = false) {
  await seedLocations(shouldClear);
}
