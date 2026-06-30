import { NavLink, useNavigate } from "react-router-dom";
import {
  Building2,
  ClipboardList,
  FilePlus2,
  Home,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  User,
} from "lucide-react";
import { WorkShiftLogo } from "@/components/brand/WorkShiftLogo";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { label: "Tổng quan", path: "/employer/dashboard", icon: LayoutDashboard },
  { label: "Tạo bài đăng", path: "/employer/job-postings/new", icon: FilePlus2 },
  { label: "Bài đăng", path: "/employer/job-postings", icon: ClipboardList },
  { label: "Tin nhắn", path: "/messages", icon: MessageSquare },
  { label: "Thông tin cá nhân", path: "/profile/employer", icon: User },
  { label: "Thông tin doanh nghiệp", path: "/profile/organization", icon: Building2 },
];

export function EmployerSidebar() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <aside className="hidden h-dvh w-[260px] shrink-0 border-r border-slate-200 bg-white lg:sticky lg:top-0 lg:block">
      <div className="flex h-full flex-col">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex h-16 items-center gap-3 border-b border-slate-200 px-5 text-left"
        >
          <WorkShiftLogo size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-950">WorkShift</p>
            <p className="truncate text-xs font-semibold text-slate-500">
              Nhà tuyển dụng
            </p>
          </div>
        </button>

        <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
          <NavLink
            to="/"
            end
            className="mb-2 flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-950"
          >
            <Home size={18} />
            Trang chủ
          </NavLink>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/employer/job-postings"}
                className={({ isActive }) =>
                  `flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-[#EAF8F0] text-[#0A4B3E] ring-1 ring-[#BDEBD0]"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`
                }
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 p-3">
          <button
            type="button"
            onClick={() => logout()}
            className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-950"
          >
            <LogOut size={18} />
            Đăng xuất
          </button>
        </div>
      </div>
    </aside>
  );
}
