import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon: ReactNode;
  accent?: "teal" | "blue" | "orange" | "purple";
}

const accents = {
  teal: "bg-teal-500",
  blue: "bg-blue-500",
  orange: "bg-orange-400",
  purple: "bg-purple-500",
};

export function StatCard({ label, value, hint, icon, accent = "teal" }: StatCardProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">{label}</p>
        <p className="mt-1 text-2xl font-bold text-neutral-900">{value}</p>
        {hint ? <p className="mt-1 text-sm text-teal-600 font-medium">{hint}</p> : null}
      </div>
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl text-white ${accents[accent]}`}
      >
        {icon}
      </div>
    </div>
  );
}
