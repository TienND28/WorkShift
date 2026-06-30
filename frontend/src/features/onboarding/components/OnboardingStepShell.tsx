import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";

interface OnboardingStepShellProps {
  children: ReactNode;
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  loading?: boolean;
  nextDisabled?: boolean;
}

export function OnboardingStepShell({
  children,
  onBack,
  onNext,
  nextLabel = "Tiếp tục",
  loading,
  nextDisabled,
}: OnboardingStepShellProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="onboarding-card">{children}</div>

      <div className="flex gap-3">
        {onBack ? (
          <Button type="button" variant="ghost" className="flex-1" onClick={onBack}>
            Quay lại
          </Button>
        ) : null}
        <Button
          type="button"
          className={onBack ? "flex-1" : "w-full"}
          onClick={onNext}
          loading={loading}
          disabled={nextDisabled}
        >
          {nextLabel}
        </Button>
      </div>
    </div>
  );
}
