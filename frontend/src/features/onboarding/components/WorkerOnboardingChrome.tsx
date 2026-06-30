import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { OnboardingSetupHeader } from "@/features/onboarding/components/OnboardingSetupHeader";
import { LucideIcon } from "@/components/icons/LucideIcon";

interface WorkerOnboardingChromeProps {
  step: number;
  total: number;
  title?: string;
  subtitle?: string;
  centeredTitle?: boolean;
  children: ReactNode;
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  loading?: boolean;
  nextDisabled?: boolean;
  showBack?: boolean;
  closeTo?: string;
}

export function WorkerOnboardingChrome({
  step,
  total,
  title,
  subtitle,
  centeredTitle = false,
  children,
  onBack,
  onNext,
  nextLabel = "Tiếp theo",
  loading = false,
  nextDisabled = false,
  showBack = false,
  closeTo,
}: WorkerOnboardingChromeProps) {
  const navigate = useNavigate();
  const dualActions = showBack && Boolean(onBack);

  const rightSlot = closeTo ? (
    <button
      type="button"
      aria-label="Đóng"
      className="p-2 text-on-surface-variant transition-colors hover:text-primary"
      onClick={() => navigate(closeTo)}
    >
      <LucideIcon name="close" size={22} />
    </button>
  ) : undefined;

  return (
    <div className="onboarding-shell">
      <OnboardingSetupHeader step={step} total={total} rightSlot={rightSlot} />

      <main className="onboarding-main flex-1 pb-10 pt-8">
        {(title || subtitle) && (
          <div className={`mb-8 ${centeredTitle ? "text-center" : ""}`}>
            {title ? <h1 className="onboarding-title mb-2">{title}</h1> : null}
            {subtitle ? <p className="onboarding-subtitle">{subtitle}</p> : null}
          </div>
        )}

        {children}

        <div className="onboarding-actions">
          {dualActions ? (
            <button type="button" className="onboarding-btn-outline" onClick={onBack}>
              Quay lại
            </button>
          ) : null}
          <button
            type="button"
            className={`onboarding-btn-primary ${dualActions ? "flex-grow-next" : "solo"}`}
            onClick={onNext}
            disabled={nextDisabled || loading}
          >
            {loading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              nextLabel
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
