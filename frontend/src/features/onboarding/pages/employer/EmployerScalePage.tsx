import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { OnboardingLayout } from "@/features/onboarding/layout/OnboardingLayout";
import { OnboardingStepShell } from "@/features/onboarding/components/OnboardingStepShell";
import { employerApi } from "@/lib/api/employer.api";

const scales = [
  {
    level: 1 as const,
    title: "Tuyển dụng nhỏ",
    description:
      "Hộ kinh doanh, quán cafe, cửa hàng — tuyển vài ca hoặc vài nhân sự.",
  },
  {
    level: 2 as const,
    title: "Doanh nghiệp lớn",
    description:
      "Công ty, chuỗi cửa hàng — quản lý nhiều ca và nhiều chi nhánh.",
  },
];

export function EmployerScalePage() {
  const navigate = useNavigate();
  const [level, setLevel] = useState<1 | 2 | null>(null);
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    if (!level) return;
    setLoading(true);
    try {
      await employerApi.createProfile();
      navigate("/onboarding/employer/organization", {
        state: { verificationLevel: level },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout
      step={1}
      total={2}
      title="Quy mô tuyển dụng"
      subtitle="Chọn mô hình phù hợp — bạn có thể cập nhật sau."
    >
      <OnboardingStepShell
        onNext={handleNext}
        loading={loading}
        nextDisabled={!level}
      >
        <div className="space-y-3">
          {scales.map((s) => {
            const active = level === s.level;
            return (
              <button
                key={s.level}
                type="button"
                onClick={() => setLevel(s.level)}
                className={`group w-full rounded-2xl border border-border-subtle bg-surface-container-lowest p-(--spacing-container-padding) text-left transition-all duration-200 hover:bg-surface-container-low active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${active
                    ? "border-primary bg-surface-container ring-2 ring-primary"
                    : ""
                  }`}
              >
                <p className="text-lg font-semibold text-primary">
                  {s.title}
                </p>

                <p className="mt-(--spacing-base) text-sm text-on-surface-variant">
                  {s.description}
                </p>
              </button>
            );
          })}
        </div>
      </OnboardingStepShell>
    </OnboardingLayout>
  );
}
