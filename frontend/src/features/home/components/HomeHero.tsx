import { ArrowRight } from "lucide-react";

export function HomeHero() {
  return (
    <section className="relative overflow-hidden rounded-lg border border-emerald-900/10 bg-[#0A4B3E] text-white shadow-sm">
      <img
        src="https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1400&h=420&fit=crop"
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-45"
      />
      <div className="absolute inset-0 bg-[#007A35]/75" />

      <div className="relative flex min-h-[210px] items-center justify-between gap-6 p-6 sm:p-8">
        <div className="max-w-[560px]">
          <p className="text-xs font-extrabold uppercase tracking-wide">
            Bảng tin WorkShift
          </p>
          <h1 className="mt-2 text-3xl font-bold leading-tight tracking-normal sm:text-4xl">
            Tìm việc nhanh chóng, ứng tuyển dễ dàng.
          </h1>
          <p className="mt-4 max-w-[520px] text-sm font-medium leading-6 text-white/95">
            Khám phá hàng ngàn cơ hội việc làm bán thời gian và lâu dài phù hợp nhất cho bạn hôm nay.
          </p>
          <button
            type="button"
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-md bg-[#00B14F] px-5 text-sm font-bold text-white transition hover:bg-[#009643] active:bg-[#0A4B3E]"
          >
            Bắt đầu ngay
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="hidden min-w-[150px] rounded-md bg-white px-6 py-5 text-center text-slate-700 shadow-sm md:block">
          <p className="text-4xl font-extrabold text-[#009643]">128</p>
          <p className="mt-1 text-xs font-semibold">công việc mới tuần này</p>
        </div>
      </div>
    </section>
  );
}
