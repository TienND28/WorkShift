import { Link } from "react-router-dom";
import { FilePlus2, Search } from "lucide-react";
import { EmployerSidebar } from "@/components/layout/EmployerSidebar";

export function EmployerJobPostingsPage() {
  return (
    <div className="min-h-dvh bg-white text-slate-950">
      <div className="flex">
        <EmployerSidebar />

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between gap-4 px-4 sm:px-6">
              <div>
                <p className="text-xs font-semibold text-[#0A4B3E]">
                  Quản lý tuyển dụng
                </p>
                <h1 className="text-base font-bold text-slate-950">
                  Bài đăng tuyển dụng
                </h1>
              </div>

              <Link
                to="/employer/job-postings/new"
                className="inline-flex h-10 items-center gap-2 rounded-md bg-[#00B14F] px-4 text-sm font-bold text-white shadow-sm hover:bg-[#009643]"
              >
                <FilePlus2 size={16} />
                Tạo bài đăng
              </Link>
            </div>
          </header>

          <div className="mx-auto max-w-[1180px] space-y-4 px-4 py-6 sm:px-6">
            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">
                    Danh sách bài đăng
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Theo dõi các bài đăng casual, trạng thái xuất bản và nhu cầu
                    tuyển theo từng ca.
                  </p>
                </div>

                <label className="relative block sm:w-[280px]">
                  <Search
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    placeholder="Tìm theo tiêu đề bài đăng"
                    className="h-10 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-[#009643] focus:ring-2 focus:ring-emerald-100"
                  />
                </label>
              </div>
            </section>

            <section className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
              <p className="text-sm font-semibold text-slate-700">
                Chưa có bài đăng nào để hiển thị.
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Khi tạo bài đăng casual, danh sách và trạng thái sẽ được hiển thị
                tại đây.
              </p>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
