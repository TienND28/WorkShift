import { HomeFilters } from "@/features/home/components/HomeFilters";
import { HomeJobCard, type HomeJob } from "@/features/home/components/HomeJobCard";

const logoFor = (label: string, color: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="${color}"/><text x="24" y="30" text-anchor="middle" font-family="Arial" font-size="18" font-weight="700" fill="white">${label}</text></svg>`,
  )}`;

const jobs: HomeJob[] = [
  {
    id: "service-weekend",
    title: "Nhân viên Phục vụ tiệc cưới (Part-time)",
    company: "Intercontinental Landmark 72",
    logo: logoFor("IL", "#E2E8F0"),
    tags: ["Phục vụ", "Trả lương theo ngày"],
    location: "Nam Từ Liêm, Hà Nội",
    postedAt: "2 giờ trước",
    pay: "350.000đ",
    payUnit: "/ Buổi",
  },
  {
    id: "cashier",
    title: "Nhân viên Bán hàng & Thu ngân",
    company: "WinMart+ Thủ Đức",
    logo: logoFor("W", "#0A4B3E"),
    tags: ["Bán hàng", "Xoay ca"],
    imageUrl: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=900&h=340&fit=crop",
    location: "TP. Thủ Đức, HCM",
    postedAt: "5 giờ trước",
    pay: "28.000đ",
    payUnit: "/ Giờ",
    saved: true,
  },
  {
    id: "barista",
    title: "Pha chế (Barista) - Ca tối",
    company: "Highlands Coffee - Quận 1",
    logo: logoFor("H", "#6B3F2A"),
    tags: ["Pha chế", "Ca tối"],
    description:
      "Tuyển 3 nhân viên pha chế ca tối 18:00-22:00, T2-T6. Lương 45k/giờ + thưởng. Ưu tiên sinh viên có kinh nghiệm pha chế.",
    location: "Quận 1, HCM",
    postedAt: "8 giờ trước",
    pay: "45.000đ",
    payUnit: "/ Giờ",
  },
];

export function HomeFeedContent() {
  return (
    <div className="space-y-5">
      <HomeFilters />

      <section className="space-y-4" aria-label="Danh sách công việc">
        {jobs.map((job) => (
          <HomeJobCard key={job.id} job={job} />
        ))}
      </section>
    </div>
  );
}
