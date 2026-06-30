import type { ReactNode } from "react";
import { WorkShiftLogo } from "@/components/brand/WorkShiftLogo";

interface OnboardingSetupHeaderProps {
  step?: number;
  total?: number;
  rightSlot?: ReactNode;
}

export function OnboardingSetupHeader({
  step,
  total,
  rightSlot,
}: OnboardingSetupHeaderProps) {
  const showProgress = step != null && total != null && total > 0;

  return (
    <header className="app-header px-(--spacing-container-padding)">
      <div className="flex w-24 shrink-0 items-center justify-start">
        <WorkShiftLogo className="h-8" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col items-center justify-center px-2">
        {showProgress ? (
          <>
            <span className="text-sm font-semibold text-on-surface-variant">
              Bước {step} / {total}
            </span>
            <div className="mt-1 flex gap-1">
              {Array.from({ length: total }, (_, i) => (
                <div
                  key={i}
                  className={`h-1 w-8 rounded-full transition-colors ${
                    i < step ? "bg-primary" : "bg-surface-container-high"
                  }`}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>

      <div className="flex w-24 shrink-0 items-center justify-end">
        {rightSlot ?? <span className="w-8" aria-hidden />}
      </div>
    </header>
  );
}
