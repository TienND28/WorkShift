import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { WorkShiftLogo } from "@/components/brand/WorkShiftLogo";
import { adminIndustryLabel } from "@/lib/catalog-labels";
import { useAuth } from "@/hooks/useAuth";

function NavIcon({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-700 [&_svg]:h-4 [&_svg]:w-4">
      {children}
    </span>
  );
}

function linkClass({ isActive }: { isActive: boolean }) {
  return `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
    isActive
      ? "bg-white text-neutral-900 shadow-sm"
      : "text-neutral-600 hover:bg-white/60 hover:text-neutral-900"
  }`;
}

export function AdminSidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <aside className="hidden md:flex w-60 lg:w-64 shrink-0 flex-col border-r border-neutral-200 bg-white px-4 py-6">
      <div className="flex items-center gap-2 px-2 mb-8">
        <WorkShiftLogo size="sm" />
        <div>
          <p className="font-bold text-neutral-900 leading-tight">WorkShift</p>
          <p className="text-[10px] uppercase tracking-wider text-teal-600 font-bold">
            Admin
          </p>
        </div>
      </div>

      <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
        Tổng quan
      </p>
      <nav className="space-y-1">
        <NavLink to="/admin" end className={linkClass}>
          <NavIcon>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12l9-9 9 9M5 10v10h14V10" />
            </svg>
          </NavIcon>
          Dashboard
        </NavLink>
      </nav>

      <p className="px-3 mt-6 mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
        Danh mục
      </p>
      <nav className="space-y-1">
        <NavLink to="/admin/industries" className={linkClass}>
          <NavIcon>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </NavIcon>
          {adminIndustryLabel}
        </NavLink>
        <NavLink to="/admin/positions" className={linkClass}>
          <NavIcon>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
              <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
            </svg>
          </NavIcon>
          Vị trí công việc
        </NavLink>
      </nav>

      <p className="px-3 mt-6 mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
        Hệ thống
      </p>
      <nav className="space-y-1">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-600 hover:bg-white/60"
        >
          <NavIcon>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M4 12h11" />
            </svg>
          </NavIcon>
          Về ứng dụng
        </button>
      </nav>

      <div className="mt-auto rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 p-4 text-white">
        <p className="text-sm font-semibold">WorkShift</p>
        <p className="mt-1 text-xs text-teal-50/90">
          Quản lý danh mục loại hình kinh doanh và vị trí cho worker & employer.
        </p>
      </div>

      <div className="mt-4 flex items-center gap-2 px-2">
        <div className="h-9 w-9 rounded-full bg-neutral-100 flex items-center justify-center text-sm font-bold text-neutral-600">
          {user?.username?.[0]?.toUpperCase() ?? "A"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-neutral-900">{user?.fullName}</p>
          <button
            type="button"
            onClick={() => logout()}
            className="text-xs text-neutral-500 hover:text-teal-600"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </aside>
  );
}
