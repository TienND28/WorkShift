import { Bell, Search, UserRound } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { WorkShiftLogo } from "@/components/brand/WorkShiftLogo";
import { useAuth } from "@/hooks/useAuth";
import { useAuthPrompt } from "@/features/auth/context/AuthPromptContext";

const tabs = [
  { label: "Tuyển dụng Casual", path: "/jobs/casual" },
  { label: "Nhân viên lâu dài", path: "/jobs/long-term" },
];

export function FeedHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { openAuthPrompt } = useAuthPrompt();

  const isEmployer = Boolean(user?.profileTypes.includes("EMPLOYER"));
  const profilePath = isEmployer ? "/profile/employer" : "/profile";

  return (
    <header className="fixed inset-x-0 top-0 z-[60] border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          to="/jobs/casual"
          className="shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00B14F] focus-visible:ring-offset-2"
          aria-label="WorkShift"
        >
          <WorkShiftLogo size="sm" className="[&>span:first-child]:hidden" />
        </Link>

        <nav className="hidden h-full items-center gap-5 md:flex" aria-label="Điều hướng chính">
          {tabs.map((tab) => {
            const active = location.pathname.startsWith(tab.path);

            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={`flex h-full items-center border-b-2 px-1 text-xs font-semibold transition-colors ${
                  active
                    ? "border-[#009643] text-[#0A4B3E]"
                    : "border-transparent text-slate-700 hover:border-slate-300 hover:text-[#0A4B3E]"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        <label className="relative mx-auto hidden w-full max-w-[520px] sm:block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
          <input
            type="search"
            placeholder="Tìm kiếm công việc..."
            className="h-10 w-full rounded-full border border-slate-300 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-[#00B14F] focus:bg-white focus:ring-2 focus:ring-[#00B14F]/20"
          />
        </label>

        <div className="ml-auto flex shrink-0 items-center gap-3">
          {isAuthenticated ? (
            <>
              <button
                type="button"
                onClick={() => navigate("/notifications")}
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100 hover:text-[#0A4B3E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00B14F] focus-visible:ring-offset-2"
                aria-label="Thông báo"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
              </button>

              <button
                type="button"
                onClick={() => navigate(profilePath)}
                className="inline-flex h-10 items-center gap-2 rounded-full px-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00B14F] focus-visible:ring-offset-2"
              >
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.username}
                    className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#00B14F] text-white">
                    <UserRound className="h-4 w-4" />
                  </span>
                )}
                <span className="hidden sm:inline">Tài khoản</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => openAuthPrompt()}
              className="inline-flex h-10 items-center justify-center rounded-full bg-[#00B14F] hover:bg-[#009643] px-5 text-sm font-bold text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00B14F] focus-visible:ring-offset-2"
            >
              Đăng nhập
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
