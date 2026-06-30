/**
 * Ngành nghề & vị trí mẫu cho nền tảng việc làm ca (WorkShift).
 * Dùng khi seed MongoDB — không phụ thuộc API bên ngoài.
 */
export type IndustrySeed = {
  code: string;
  name: string;
  positions: { code: string; name: string }[];
};

export const INDUSTRIES_AND_POSITIONS: IndustrySeed[] = [
  {
    code: "fnb",
    name: "Ăn uống & Phục vụ",
    positions: [
      { code: "waiter", name: "Phục vụ bàn" },
      { code: "barista", name: "Pha chế / Barista" },
      { code: "kitchen-helper", name: "Phụ bếp" },
      { code: "cashier-fnb", name: "Thu ngân F&B" },
      { code: "delivery-internal", name: "Giao hàng nội bộ" },
    ],
  },
  {
    code: "retail",
    name: "Bán lẻ & Siêu thị",
    positions: [
      { code: "sales-staff", name: "Nhân viên bán hàng" },
      { code: "cashier-retail", name: "Thu ngân" },
      { code: "stock-clerk", name: "Nhân viên kho / bổ sung hàng" },
      { code: "promoter", name: "Promoter / PG" },
    ],
  },
  {
    code: "logistics",
    name: "Giao nhận & Logistics",
    positions: [
      { code: "shipper", name: "Shipper / Giao hàng" },
      { code: "warehouse-packer", name: "Đóng gói kho" },
      { code: "loader", name: "Bốc xếp" },
      { code: "sorting-staff", name: "Phân loại hàng" },
    ],
  },
  {
    code: "hospitality",
    name: "Khách sạn & Du lịch",
    positions: [
      { code: "housekeeping", name: "Buồng phòng" },
      { code: "bellboy", name: "Hành lý / Lễ tân hỗ trợ" },
      { code: "banquet-staff", name: "Phục vụ tiệc / Sự kiện" },
    ],
  },
  {
    code: "events",
    name: "Sự kiện & Giải trí",
    positions: [
      { code: "event-staff", name: "Nhân viên sự kiện" },
      { code: "ticket-checker", name: "Soát vé" },
      { code: "mc-assistant", name: "Hỗ trợ MC / Stage" },
    ],
  },
  {
    code: "education",
    name: "Giáo dục & Đào tạo",
    positions: [
      { code: "tutor", name: "Gia sư / Trợ giảng" },
      { code: "library-assistant", name: "Thư viện / Hỗ trợ lớp" },
      { code: "campus-staff", name: "Nhân viên cơ sở" },
    ],
  },
  {
    code: "office",
    name: "Văn phòng & Hành chính",
    positions: [
      { code: "data-entry", name: "Nhập liệu" },
      { code: "receptionist", name: "Lễ tân" },
      { code: "office-helper", name: "Hỗ trợ hành chính" },
      { code: "call-center", name: "Tổng đài / CSKH" },
    ],
  },
  {
    code: "beauty",
    name: "Làm đẹp & Spa",
    positions: [
      { code: "spa-reception", name: "Lễ tân spa" },
      { code: "nail-tech-assistant", name: "Phụ nail / mi" },
      { code: "salon-helper", name: "Phụ salon tóc" },
    ],
  },
  {
    code: "construction",
    name: "Xây dựng & Cơ khí",
    positions: [
      { code: "construction-helper", name: "Phụ hồ" },
      { code: "painter-helper", name: "Phụ sơn" },
      { code: "site-cleaner", name: "Vệ sinh công trường" },
    ],
  },
  {
    code: "manufacturing",
    name: "Sản xuất & Nhà máy",
    positions: [
      { code: "line-worker", name: "Công nhân dây chuyền" },
      { code: "qc-helper", name: "Hỗ trợ kiểm tra chất lượng" },
      { code: "machine-operator-assistant", name: "Phụ vận hành máy" },
    ],
  },
  {
    code: "agriculture",
    name: "Nông nghiệp",
    positions: [
      { code: "farm-worker", name: "Nông dân / Thu hoạch" },
      { code: "packing-farm", name: "Đóng gói nông sản" },
    ],
  },
  {
    code: "other",
    name: "Khác",
    positions: [
      { code: "general-labor", name: "Lao động phổ thông" },
      { code: "security-guard", name: "Bảo vệ" },
      { code: "cleaner", name: "Vệ sinh" },
    ],
  },
];
