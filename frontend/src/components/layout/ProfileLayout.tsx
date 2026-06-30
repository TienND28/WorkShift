import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { WorkShiftLogo } from "@/components/brand/WorkShiftLogo";
import { LucideIcon } from "@/components/icons/LucideIcon";

interface ProfileLayoutProps {
  children: ReactNode;
  title: string;
  backTo?: string;
  actions?: ReactNode;
}

export function ProfileLayout({
  children,
  title,
  backTo = "/",
  actions,
}: ProfileLayoutProps) {
  const showBack = Boolean(backTo && backTo !== "/");

  return (
    <div className="onboarding-shell">
      <header className="app-header px-(--spacing-container-padding)">
        <div className="flex w-28 shrink-0 items-center gap-0.5">
          {showBack ? (
            <Link
              to={backTo}
              className="p-2 text-on-surface-variant transition-colors hover:text-primary"
              aria-label="Quay lại"
            >
              <LucideIcon name="arrow_back" size={22} />
            </Link>
          ) : null}
          <Link to="/" aria-label="WorkShift trang chủ">
            <WorkShiftLogo className="h-8" />
          </Link>
        </div>

        <h1 className="min-w-0 flex-1 truncate px-2 text-center text-sm font-semibold text-primary">
          {title}
        </h1>

        <div className="flex w-28 shrink-0 items-center justify-end gap-2">
          {actions}
        </div>
      </header>

      <main className="onboarding-main flex-1 pb-10 pt-8">{children}</main>
    </div>
  );
}
