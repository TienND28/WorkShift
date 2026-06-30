import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { StatCard } from "@/components/admin/StatCard";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { industryApi } from "@/lib/api/industry.api";
import { positionApi } from "@/lib/api/position.api";
import { adminIndustryLabel } from "@/lib/catalog-labels";

export function AdminDashboardPage() {
  const [stats, setStats] = useState({
    industries: 0,
    industriesActive: 0,
    positions: 0,
    positionsActive: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([industryApi.listAll(), positionApi.listAll()])
      .then(([industries, positions]) => {
        setStats({
          industries: industries.length,
          industriesActive: industries.filter((i) => i.isActive).length,
          positions: positions.length,
          positionsActive: positions.filter((p) => p.isActive).length,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout
      title="Dashboard"
      subtitle="Tổng quan quản trị danh mục WorkShift"
    >
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={adminIndustryLabel}
          value={loading ? "…" : stats.industries}
          hint={`${stats.industriesActive} đang active`}
          accent="teal"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
            </svg>
          }
        />
        <StatCard
          label="Vị trí"
          value={loading ? "…" : stats.positions}
          hint={`${stats.positionsActive} đang active`}
          accent="blue"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
            </svg>
          }
        />
        <StatCard
          label="Nền tảng"
          value="WorkShift"
          hint="Casual job platform"
          accent="purple"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          }
        />
        <StatCard
          label="Vai trò"
          value="System Admin"
          hint="Quản lý danh mục"
          accent="orange"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          }
        />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-neutral-900">WorkShift Admin</h2>
          <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
            Trang quản trị giúp bạn cập nhật danh mục {adminIndustryLabel.toLowerCase()} và vị trí
            công việc dùng trong onboarding worker, hồ sơ nhà tuyển dụng và đăng ca.
          </p>
          <Link
            to="/admin/industries"
            className="mt-4 inline-flex text-sm font-semibold text-teal-600 hover:text-teal-700"
          >
            Quản lý {adminIndustryLabel.toLowerCase()} →
          </Link>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-neutral-900 p-6 text-white shadow-sm">
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-teal-500/30 blur-2xl" />
          <h2 className="relative text-lg font-bold">Quản lý vị trí</h2>
          <p className="relative mt-2 text-sm text-neutral-300">
            Mỗi vị trí gắn với một {adminIndustryLabel.toLowerCase()}. Worker chọn vị trí mong muốn
            khi hoàn tất hồ sơ.
          </p>
          <Link
            to="/admin/positions"
            className="relative mt-4 inline-flex text-sm font-semibold text-teal-300 hover:text-teal-200"
          >
            Quản lý vị trí →
          </Link>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-400">
          Truy cập nhanh
        </h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            to="/admin/industries"
            className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-medium hover:border-teal-300 hover:bg-teal-50 transition"
          >
            + {adminIndustryLabel}
          </Link>
          <Link
            to="/admin/positions"
            className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-medium hover:border-teal-300 hover:bg-teal-50 transition"
          >
            + Vị trí công việc
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}
