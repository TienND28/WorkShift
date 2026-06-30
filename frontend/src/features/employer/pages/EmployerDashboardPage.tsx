import {
  Bell,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Clock3,
  MessageSquare,
  Plus,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { EmployerSidebar } from "@/components/layout/EmployerSidebar";
import { WorkShiftLogo } from "@/components/brand/WorkShiftLogo";
import { useAuth } from "@/hooks/useAuth";

const metrics = [
  {
    label: "Ca đang tuyển",
    value: "14",
    change: "+2 hôm nay",
    note: "5 ca cần chốt trong 24h",
  },
  {
    label: "Ứng viên đang xử lý",
    value: "84",
    change: "12 hồ sơ mới",
    note: "Bao gồm ca linh hoạt và vị trí dài hạn",
  },
  {
    label: "Lịch phỏng vấn",
    value: "6",
    change: "3 hôm nay",
    note: "2 vị trí toàn thời gian",
  },
  {
    label: "Thời gian tuyển TB",
    value: "12d",
    change: "-15%",
    note: "Tốt hơn kỳ trước",
  },
];

const casualShifts = [
  {
    title: "Nhân viên sự kiện",
    location: "Trung tâm hội nghị quận 1",
    time: "08:00 - 16:00",
    filled: "4/4",
    status: "Đã đủ người",
  },
  {
    title: "Nhân viên kho ca đêm",
    location: "Kho phía Tây",
    time: "22:00 - 06:00",
    filled: "2/8",
    status: "Cần gấp",
  },
];

const careerRoles = [
  {
    title: "Trưởng nhóm thiết kế trải nghiệm",
    type: "Toàn thời gian",
    stage: "Đang phỏng vấn",
    salary: "Thỏa thuận",
    candidates: 24,
  },
  {
    title: "Quản lý vận hành",
    type: "Toàn thời gian",
    stage: "Đề nghị nhận việc",
    salary: "Thỏa thuận",
    candidates: 18,
  },
];

const interviews = [
  {
    name: "Alex Rivera",
    role: "Thiết kế sản phẩm",
    time: "14:00",
    round: "Trao đổi hồ sơ năng lực",
  },
  {
    name: "Maya Patel",
    role: "Trưởng nhóm vận hành hệ thống",
    time: "16:30",
    round: "Vòng cuối",
  },
];

const activities = [
  "3 nhân sự đã xác nhận có mặt tại trung tâm hội nghị quận 1",
  "Có 5 hồ sơ mới cho vị trí lập trình viên cao cấp",
  "Ca trưởng kho đang chờ xác nhận ứng viên",
];

function StatCard({
  label,
  value,
  change,
  note,
}: {
  label: string;
  value: string;
  change: string;
  note: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300">
      <p className="text-[12px] font-semibold text-slate-500">{label}</p>
      <div className="mt-2 flex items-end gap-2">
        <span className="text-3xl font-bold tracking-tight text-slate-950">
          {value}
        </span>
        <span className="pb-1 text-xs font-semibold text-[#009643]">
          {change}
        </span>
      </div>
      <p className="mt-2 text-xs text-slate-500">{note}</p>
    </div>
  );
}

function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-slate-950">{title}</h2>
        {action ? (
          <button className="text-xs font-bold text-[#0A4B3E] hover:text-[#009643]">
            {action}
          </button>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function EmployerDashboardPage() {
  const { user } = useAuth();
  const displayName = user?.fullName?.split(" ")[0] || "bạn";

  return (
    <div className="min-h-dvh bg-white text-slate-950">
      <div className="flex">
        <EmployerSidebar />

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-[1180px] items-center gap-4 px-4 sm:px-6">
              <a href="/" className="flex items-center gap-2 sm:hidden">
                <WorkShiftLogo size="sm" />
                <span className="text-sm font-bold">WorkShift</span>
              </a>

              <nav className="hidden items-center gap-1 md:flex">
                <button className="rounded-md bg-[#00B14F] px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#009643]">
                  Tổng quan
                </button>
                <button className="rounded-md px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-[#0A4B3E]">
                  Ca linh hoạt
                </button>
                <button className="rounded-md px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-[#0A4B3E]">
                  Tuyển dài hạn
                </button>
                <button className="rounded-md px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-[#0A4B3E]">
                  Ứng viên
                </button>
              </nav>

              <div className="ml-auto flex items-center gap-2">
                <Link
                  to="/employer/job-postings/new"
                  className="hidden h-10 items-center gap-2 rounded-md bg-[#00B14F] px-4 text-sm font-bold text-white shadow-sm hover:bg-[#009643] sm:inline-flex"
                >
                  <Plus size={16} />
                  Đăng tuyển
                </Link>
                <button className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-[#0A4B3E] hover:bg-slate-100">
                  <Bell size={18} />
                </button>
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-sm font-bold text-[#0A4B3E]">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.username}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    displayName.charAt(0).toUpperCase()
                  )}
                </div>
              </div>
            </div>
          </header>

          <div className="mx-auto grid max-w-[1180px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_300px]">
            <div className="min-w-0 space-y-6">
              <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#0A4B3E]">
                    Bảng điều khiển tuyển dụng
                  </p>
                  <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
                    Chào mừng trở lại, {displayName}
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm text-slate-600">
                    Theo dõi ca làm ngắn hạn, danh sách ứng viên và các vị trí dài hạn
                    trong cùng một nơi.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 hover:bg-slate-100">
                    <Search size={16} />
                    Tìm ứng viên
                  </button>
                  <Link
                    to="/employer/job-postings/new"
                    className="inline-flex h-10 items-center gap-2 rounded-md bg-[#00B14F] px-3 text-sm font-bold text-white shadow-sm hover:bg-[#009643]"
                  >
                    <Plus size={16} />
                    Tạo tin
                  </Link>
                </div>
              </section>

              <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {metrics.map((metric) => (
                  <StatCard key={metric.label} {...metric} />
                ))}
              </section>

              <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                <Panel title="Ca linh hoạt đang hoạt động" action="Xem lịch">
                  <div className="space-y-3">
                    {casualShifts.map((shift) => (
                      <div
                        key={shift.title}
                        className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-[#0A4B3E]">
                          <CalendarClock size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-bold text-slate-950">{shift.title}</p>
                            <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                              Linh hoạt
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            {shift.location} · {shift.time}
                          </p>
                        </div>
                        <div className="text-right text-xs">
                          <p className="font-bold text-slate-950">{shift.filled} đã chốt</p>
                          <p
                            className={
                              shift.status === "Cần gấp"
                                ? "font-semibold text-red-600"
                                : "font-semibold text-[#009643]"
                            }
                          >
                            {shift.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Panel>

                <Panel title="Kế hoạch tuyển dụng" action="Xem kế hoạch">
                  <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                    <div className="rounded-lg border border-slate-200 bg-white p-4 text-slate-950">
                      <Sparkles size={20} />
                      <p className="mt-3 text-sm font-bold">Nhịp tuyển dụng</p>
                      <p className="mt-1 text-xs leading-5 text-slate-600">
                        Chất lượng ứng viên tăng 12% tuần này. Tập trung xử lý 4 đề nghị
                        đang chờ phản hồi.
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-4">
                      <div className="flex items-center gap-2">
                        <BriefcaseBusiness size={18} className="text-[#0A4B3E]" />
                        <p className="text-sm font-bold">Mở rộng dài hạn</p>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-slate-600">
                        Chuẩn bị danh sách ứng viên cho vị trí toàn thời gian, hợp đồng và thực tập.
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-4">
                      <div className="flex items-center gap-2">
                        <Users size={18} className="text-[#0A4B3E]" />
                        <p className="text-sm font-bold">Nguồn ứng viên</p>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-slate-600">
                        Lưu ứng viên tốt từ ca linh hoạt để mời vào vị trí lâu dài.
                      </p>
                    </div>
                  </div>
                </Panel>
              </div>

              <Panel title="Tuyển dụng dài hạn" action="Báo cáo đầy đủ">
                <div className="grid gap-4 md:grid-cols-2">
                  {careerRoles.map((role) => (
                    <article
                      key={role.title}
                      className="rounded-lg border border-slate-200 border-l-4 border-l-[#0A4B3E] bg-white p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-slate-950">{role.title}</h3>
                          <span className="mt-2 inline-flex rounded bg-[#EAF8F0] px-2 py-1 text-[10px] font-bold uppercase text-[#0A4B3E] ring-1 ring-[#BDEBD0]">
                            {role.type}
                          </span>
                        </div>
                        <span className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-bold uppercase text-slate-600">
                          {role.stage}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-200 pt-3 text-xs">
                        <div>
                          <p className="text-slate-500">Lương</p>
                          <p className="mt-1 font-bold">{role.salary}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Ứng viên</p>
                          <p className="mt-1 font-bold">{role.candidates} người</p>
                        </div>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <button className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-[#0A4B3E] hover:bg-slate-100">
                          Lọc hồ sơ
                        </button>
                        <button className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100">
                          Xem
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </Panel>
            </div>

            <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
              <Panel title="Lịch phỏng vấn">
                <div className="space-y-3">
                  {interviews.map((interview) => (
                    <div key={interview.name} className="flex gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-[#0A4B3E]">
                        {interview.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-950">{interview.name}</p>
                        <p className="text-xs text-slate-500">
                          {interview.role} · {interview.time}
                        </p>
                        <p className="mt-1 text-[11px] font-semibold text-slate-600">
                          {interview.round}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title="Việc cần xử lý">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 text-slate-900">
                    <CheckCircle2 size={18} />
                    <p className="text-sm font-bold">Duyệt 8 hồ sơ phù hợp</p>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 text-slate-900">
                    <Clock3 size={18} />
                    <p className="text-sm font-bold">Xác nhận 2 đề nghị trước 17:00</p>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 text-slate-900">
                    <MessageSquare size={18} />
                    <p className="text-sm font-bold">Trả lời 5 tin nhắn ứng viên</p>
                  </div>
                </div>
              </Panel>

              <Panel title="Hoạt động gần đây">
                <ul className="space-y-3">
                  {activities.map((activity) => (
                    <li key={activity} className="flex gap-2 text-sm text-slate-600">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0A4B3E]" />
                      <span>{activity}</span>
                    </li>
                  ))}
                </ul>
              </Panel>

              <button className="flex w-full items-center justify-between rounded-lg bg-[#00B14F] p-4 text-left text-white shadow-sm hover:bg-[#009643]">
                <span>
                  <span className="block text-sm font-bold">Xem phân tích</span>
                  <span className="mt-1 block text-xs text-white/80">
                    Phễu tuyển dụng, nguồn ứng viên, hiệu quả từng vị trí
                  </span>
                </span>
                <ChevronRight size={18} />
              </button>
            </aside>
          </div>

          <Link
            to="/employer/job-postings/new"
            className="fixed bottom-5 right-5 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-[#00B14F] text-white shadow-lg hover:bg-[#009643]"
            aria-label="Tạo tin tuyển dụng"
          >
            <Plus size={22} />
          </Link>
        </main>
      </div>
    </div>
  );
}
