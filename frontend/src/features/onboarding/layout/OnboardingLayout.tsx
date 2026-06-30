import type { ReactNode } from "react";
import { OnboardingSetupHeader } from "@/features/onboarding/components/OnboardingSetupHeader";

interface OnboardingLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  step?: number;
  total?: number;
  className?: string;
  centered?: boolean;
  wide?: boolean;
}

export function OnboardingLayout({
  children,
  title,
  subtitle,
  step,
  total,
  className,
  centered = false,
  wide = false,
}: OnboardingLayoutProps) {
  return (
    <div className="onboarding-shell">
      <OnboardingSetupHeader step={step} total={total} />

      <main
        className={[
          "onboarding-main flex-1 flex-col pb-10 pt-8",
          wide ? "max-w-3xl" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {title ? (
          <div className={centered ? "mb-10 text-center" : "mb-8"}>
            <h1 className="onboarding-title">{title}</h1>
            {subtitle ? <p className="onboarding-subtitle mt-2">{subtitle}</p> : null}
          </div>
        ) : null}
        {children}
      </main>
    </div>
  );
}
