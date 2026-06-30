# Master data seed

Dữ liệu **63 tỉnh/thành + quận/huyện + xã/phường** (trước sáp nhập 2025) và catalog **industries / positions**.

## Nguồn địa giới

| Nguồn | Ghi chú |
|--------|---------|
| [madnh/hanhchinhvn](https://github.com/madnh/hanhchinhvn) `tree.json` | **Dùng** — 63 tỉnh, có Thừa Thiên Huế (46) |
| provinces.open-api.vn | **Không dùng** — đã chuyển 34 tỉnh sau sáp nhập |

## Lệnh

```bash
# 1) Tải JSON (~5MB) vào src/seeds/data/
npm run seed:fetch

# 2) Import vào MongoDB (cần MONGO_URI trong .env)
npm run seed

# Xóa rồi import lại
npm run seed:clear

# Chỉ một phần
npm run seed:locations
npm run seed:catalog
```

## File

- `fetch-vn-locations.ts` — tải & chuẩn hóa `vn-locations-pre-merger.json`
- `data/industries-positions.ts` — 12 ngành + vị trí ca làm
- `master-data.seeder.ts` — upsert Province / District / Ward / Industry / Position
- `run.ts` — CLI
