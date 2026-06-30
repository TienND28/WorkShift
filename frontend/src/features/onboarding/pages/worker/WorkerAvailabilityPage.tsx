import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { WorkerOnboardingChrome } from "@/features/onboarding/components/WorkerOnboardingChrome";
import { LucideIcon } from "@/components/icons/LucideIcon";
import { workerApi, type WorkerAvailability } from "@/lib/api/worker.api";
import { useAuth } from "@/hooks/useAuth";
import { useWorkerProfileLimits } from "@/hooks/useWorkerProfileLimits";

const WEEKDAYS = [
  { value: 1, label: "Thứ 2" },
  { value: 2, label: "Thứ 3" },
  { value: 3, label: "Thứ 4" },
  { value: 4, label: "Thứ 5" },
  { value: 5, label: "Thứ 6" },
  { value: 6, label: "Thứ 7" },
  { value: 0, label: "Chủ nhật" },
];

const defaultSlot = (): WorkerAvailability => ({
  weekday: 1,
  startTime: "08:00",
  endTime: "12:00",
});

export function WorkerAvailabilityPage() {
  const navigate = useNavigate();
  const { refreshMe } = useAuth();
  const { limits } = useWorkerProfileLimits();
  const maxAvailabilities = limits.availabilities;
  const [slots, setSlots] = useState<WorkerAvailability[]>([defaultSlot()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateSlot = (index: number, patch: Partial<WorkerAvailability>) => {
    setSlots((prev) =>
      prev.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    );
  };

  const handleFinish = async () => {
    setLoading(true);
    setError(null);
    try {
      await workerApi.updateProfile({ availabilities: slots });
      await refreshMe();
      navigate("/", { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lưu thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <WorkerOnboardingChrome
      step={4}
      total={4}
      title="Thời gian rảnh"
      subtitle="Thêm khung giờ bạn thường có thể đi làm."
      centeredTitle
      showBack
      onBack={() => navigate("/onboarding/worker/locations")}
      onNext={handleFinish}
      nextLabel="Hoàn tất"
      loading={loading}
    >
      <div className="onboarding-card mb-(--spacing-section-gap)">
        <div className="space-y-6">
          {slots.map((slot, index) => (
            <div key={index} className="space-y-4">
              <div className="relative w-full md:w-1/2">
                <label className="sr-only" htmlFor={`day-${index}`}>
                  Chọn ngày
                </label>
                <select
                  id={`day-${index}`}
                  className="onboarding-select h-12 w-full pr-10"
                  value={slot.weekday}
                  onChange={(e) =>
                    updateSlot(index, { weekday: Number(e.target.value) })
                  }
                >
                  {WEEKDAYS.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
                <LucideIcon
                  name="expand_more"
                  size={20}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
                />
              </div>
              <div className="flex items-center gap-4">
              <div className="relative flex flex-1 items-center rounded-xl border border-transparent bg-surface-container-low transition-colors focus-within:border-primary focus-within:bg-background-light">
                <LucideIcon
                  name="schedule"
                  size={20}
                  className="absolute left-4 text-on-surface-variant"
                />
                <input
                  type="time"
                  className="w-full rounded-xl border-none bg-transparent py-3 pl-12 pr-4 text-base outline-none focus:ring-0"
                  value={slot.startTime}
                  onChange={(e) =>
                    updateSlot(index, { startTime: e.target.value })
                  }
                />
              </div>
              <span className="text-base text-on-surface-variant">-</span>
              <div className="relative flex flex-1 items-center rounded-xl border border-transparent bg-surface-container-low transition-colors focus-within:border-primary focus-within:bg-background-light">
                <LucideIcon
                  name="schedule"
                  size={20}
                  className="absolute left-4 text-on-surface-variant"
                />
                <input
                  type="time"
                  className="w-full rounded-xl border-none bg-transparent py-3 pl-12 pr-4 text-base outline-none focus:ring-0"
                  value={slot.endTime}
                  onChange={(e) =>
                    updateSlot(index, { endTime: e.target.value })
                  }
                />
              </div>
              {slots.length > 1 ? (
                <button
                  type="button"
                  aria-label="Xóa khung giờ"
                  className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-error"
                  onClick={() =>
                    setSlots((prev) => prev.filter((_, i) => i !== index))
                  }
                >
                  <LucideIcon name="close" size={20} />
                </button>
              ) : (
                <div className="w-10" />
              )}
              </div>
            </div>
          ))}
        </div>

        {slots.length < maxAvailabilities ? (
          <button
            type="button"
            className="mt-6 flex items-center gap-1 text-sm font-semibold text-secondary-container transition-opacity hover:opacity-80"
            onClick={() => setSlots((prev) => [...prev, defaultSlot()])}
          >
            <LucideIcon name="add" size={18} />
            Thêm khung giờ
          </button>
        ) : null}
      </div>

      {error ? <p className="text-sm text-error">{error}</p> : null}
    </WorkerOnboardingChrome>
  );
}
