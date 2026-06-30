import type { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export function Select({ label, error, className = "", id, children, ...props }: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <label className="block space-y-1.5">
      {label ? (
        <span className="text-xs font-bold uppercase tracking-wide text-neutral-500">
          {label}
        </span>
      ) : null}
      <select
        id={selectId}
        className={`w-full rounded-xl border border-border-subtle bg-background-light px-4 py-2.5 text-sm text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25 ${error ? "border-red-400" : ""} ${className}`}
        {...props}
      >
        {children}
      </select>
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  );
}
