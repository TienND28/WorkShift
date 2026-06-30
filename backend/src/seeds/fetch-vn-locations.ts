/**
 * Tải dữ liệu đơn vị hành chính Việt Nam 3 cấp TRƯỚC sáp nhập tỉnh (63 tỉnh/thành).
 *
 * Nguồn: https://github.com/madnh/hanhchinhvn (tree.json — GSO, cấu trúc cũ)
 * Không dùng provinces.open-api.vn vì API đó đã chuyển sang 34 tỉnh sau sáp nhập.
 */
import axios from "axios";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "data");

/** tree.json — đủ 63 tỉnh + quận/huyện + xã/phường (trước sáp nhập 2025) */
const TREE_URL =
  "https://raw.githubusercontent.com/madnh/hanhchinhvn/master/dist/tree.json";

export type WardSeed = { code: string; name: string };
export type DistrictSeed = { code: string; name: string; wards: WardSeed[] };
export type ProvinceSeed = {
  code: string;
  name: string;
  slug: string;
  type: string;
  districts: DistrictSeed[];
};

export type VnLocationsDataset = {
  version: "pre-merger-63";
  source: "hanhchinhvn";
  sourceUrl: string;
  fetchedAt: string;
  provinceCount: number;
  districtCount: number;
  wardCount: number;
  provinces: ProvinceSeed[];
};

type HanhChinhNode = {
  name: string;
  name_with_type: string;
  code: string;
  slug?: string;
  type?: string;
  "quan-huyen"?: Record<string, HanhChinhDistrictNode>;
};

type HanhChinhDistrictNode = {
  name: string;
  name_with_type: string;
  code: string;
  parent_code: string;
  "xa-phuong"?: Record<string, HanhChinhWardNode>;
};

type HanhChinhWardNode = {
  name: string;
  name_with_type: string;
  code: string;
  parent_code: string;
};

export function transformTreeToDataset(
  tree: Record<string, HanhChinhNode>,
): VnLocationsDataset {
  const provinces: ProvinceSeed[] = [];
  let districtCount = 0;
  let wardCount = 0;

  for (const prov of Object.values(tree)) {
    const districts: DistrictSeed[] = [];

    for (const dist of Object.values(prov["quan-huyen"] ?? {})) {
      const wards: WardSeed[] = Object.values(dist["xa-phuong"] ?? {}).map(
        (w) => ({
          code: w.code,
          name: w.name_with_type ?? w.name,
        }),
      );

      districtCount += 1;
      wardCount += wards.length;

      districts.push({
        code: dist.code,
        name: dist.name_with_type ?? dist.name,
        wards,
      });
    }

    provinces.push({
      code: prov.code,
      name: prov.name_with_type ?? prov.name,
      slug: prov.slug ?? prov.code,
      type: prov.type ?? "tinh",
      districts,
    });
  }

  provinces.sort((a, b) => a.code.localeCompare(b.code));

  return {
    version: "pre-merger-63",
    source: "hanhchinhvn",
    sourceUrl: TREE_URL,
    fetchedAt: new Date().toISOString(),
    provinceCount: provinces.length,
    districtCount,
    wardCount,
    provinces,
  };
}

export async function fetchVnLocationsDataset(): Promise<VnLocationsDataset> {
  console.log("⬇️  Downloading VN locations (pre-merger 63 provinces)...");
  console.log(`    ${TREE_URL}`);

  const { data: tree } = await axios.get<Record<string, HanhChinhNode>>(
    TREE_URL,
    {
      timeout: 120_000,
      maxContentLength: 20 * 1024 * 1024,
    },
  );

  const dataset = transformTreeToDataset(tree);

  if (dataset.provinceCount < 60) {
    throw new Error(
      `Expected ~63 provinces (pre-merger), got ${dataset.provinceCount}. Wrong dataset?`,
    );
  }

  const hue = dataset.provinces.find((p) => p.code === "46");
  if (hue && !hue.name.includes("Thừa Thiên Huế")) {
    console.warn(
      `⚠️  Province 46 is "${hue.name}" — may be post-merger data. Check source.`,
    );
  }

  await fs.mkdir(DATA_DIR, { recursive: true });

  const outPath = path.join(DATA_DIR, "vn-locations-pre-merger.json");
  await fs.writeFile(outPath, JSON.stringify(dataset, null, 0), "utf-8");

  const manifestPath = path.join(DATA_DIR, "manifest.json");
  await fs.writeFile(
    manifestPath,
    JSON.stringify(
      {
        locations: "vn-locations-pre-merger.json",
        industries: "industries-positions.ts (compiled in seeder)",
        version: dataset.version,
        fetchedAt: dataset.fetchedAt,
        counts: {
          provinces: dataset.provinceCount,
          districts: dataset.districtCount,
          wards: dataset.wardCount,
        },
      },
      null,
      2,
    ),
    "utf-8",
  );

  console.log(`✅ Saved: ${outPath}`);
  console.log(
    `📊 ${dataset.provinceCount} provinces, ${dataset.districtCount} districts, ${dataset.wardCount} wards`,
  );

  return dataset;
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  fetchVnLocationsDataset()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Fetch failed:", err);
      process.exit(1);
    });
}
