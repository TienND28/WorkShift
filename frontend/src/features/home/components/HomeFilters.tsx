import { SlidersHorizontal } from "lucide-react";

const filters = ["Dành cho bạn", "Phục vụ", "Giao hàng", "Bán hàng", "Kho vận", "Văn phòng"];

export function HomeFilters() {
  return (
    <div className="flex gap-3 overflow-x-auto pb-1">
      <button
        type="button"
        className="inline-flex h-10 shrink-0 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Lọc
      </button>

      {filters.map((filter, index) => (
        <button
          key={filter}
          type="button"
          className={`h-10 shrink-0 rounded-md border px-6 text-sm font-semibold transition ${
            index === 0
              ? "border-[#B8F0D2] bg-[#B8F0D2] text-[#0A4B3E]"
              : "border-slate-300 bg-white text-slate-700 hover:border-[#00B14F] hover:text-[#0A4B3E]"
          }`}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}
