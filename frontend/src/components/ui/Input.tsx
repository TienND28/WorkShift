import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = "", id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <label className="block space-y-1.5">
      {label ? (
        <span className="text-xs font-bold uppercase tracking-wide text-neutral-500">
          {label}
        </span>
      ) : null}
      <input
        id={inputId}
        className={`w-full rounded-xl border border-border-subtle bg-background-light px-4 py-2.5 text-sm text-primary outline-none transition placeholder:text-on-surface-variant focus:border-accent focus:ring-2 focus:ring-accent/25 ${error ? "border-red-400" : ""} ${className}`}
        {...props}
      />
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  );
}
