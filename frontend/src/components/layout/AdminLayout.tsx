import type { ReactNode } from "react";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

interface AdminLayoutProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}

export function AdminLayout({ title, subtitle, action, children }: AdminLayoutProps) {
  return (
    <div className="min-h-dvh bg-[#f8f9fa] flex">
      <AdminSidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-10 border-b border-neutral-200/80 bg-[#f8f9fa]/90 backdrop-blur px-6 py-5 lg:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                WorkShift Admin
              </p>
              <h1 className="text-2xl font-bold text-neutral-900">{title}</h1>
              {subtitle ? <p className="mt-1 text-sm text-neutral-500">{subtitle}</p> : null}
            </div>
            {action}
          </div>
        </header>
        <main className="flex-1 px-6 py-6 pb-24 md:pb-6 lg:px-8 lg:py-8">{children}</main>
      </div>
      <AdminMobileNav />
    </div>
  );
}
