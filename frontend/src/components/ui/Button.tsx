import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "ghost" | "google";
  fullWidth?: boolean;
  loading?: boolean;
}

export function Button({
  children,
  variant = "primary",
  fullWidth,
  loading,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary:
      "bg-accent text-accent-foreground px-6 py-3 hover:bg-accent-hover shadow-sm",
    ghost:
      "bg-background-light text-primary border border-border-subtle px-6 py-3 hover:bg-surface-container-low",
    google:
      "bg-background-light text-primary px-5 py-3 text-[15px] shadow-sm hover:bg-surface-container-low border border-border-subtle",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-200 border-t-accent" />
      ) : null}
      {children}
    </button>
  );
}
