import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { WorkerOnboardingChrome } from "@/features/onboarding/components/WorkerOnboardingChrome";
import { OnboardingSelectField } from "@/features/onboarding/components/OnboardingFormField";
import { LucideIcon } from "@/components/icons/LucideIcon";
import {
  catalogApi,
  type CatalogItem,
  type PositionItem,
} from "@/lib/api/catalog.api";
import { workerApi } from "@/lib/api/worker.api";
import { useWorkerProfileLimits } from "@/hooks/useWorkerProfileLimits";

type SelectedPosition = {
  id: string;
  name: string;
  industryId: string;
  industryName: string;
};

export function WorkerPositionsPage() {
  const navigate = useNavigate();
  const { limits } = useWorkerProfileLimits();
  const maxPositions = limits.preferredPositions;
  const [industries, setIndustries] = useState<CatalogItem[]>([]);
  const [industryId, setIndustryId] = useState("");
  const [positions, setPositions] = useState<PositionItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<SelectedPosition[]>([]);
  const [loadingPositions, setLoadingPositions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedIndustry = industries.find((i) => i.id === industryId);

  useEffect(() => {
    catalogApi
      .getIndustries()
      .then((items) => {
        setIndustries(items);
        if (items.length > 0) {
          setIndustryId(items[0].id);
        }
      })
      .catch(() => setError("Không tải được danh sách ngành nghề"));
  }, []);

  useEffect(() => {
    if (!industryId) {
      setPositions([]);
      return;
    }
    setLoadingPositions(true);
    setError(null);
    catalogApi
      .getPositions(industryId)
      .then(setPositions)
      .catch(() => setError("Không tải được vị trí công việc"))
      .finally(() => setLoadingPositions(false));
  }, [industryId]);

  const toggle = (position: PositionItem) => {
    const industryName =
      position.industry?.name ??
      industries.find((i) => i.id === industryId)?.name ??
      "";
    const industryKey = position.industry?.id ?? industryId;

    setSelectedItems((prev) => {
      const existing = prev.find((item) => item.id === position.id);
      if (existing) {
        return prev.filter((item) => item.id !== position.id);
      }
      if (prev.length >= maxPositions) {
        return prev;
      }
      return [
        ...prev,
        {
          id: position.id,
          name: position.name,
          industryId: industryKey,
          industryName,
        },
      ];
    });
  };

  const removeSelected = (id: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleNext = async () => {
    if (selectedItems.length === 0) {
      setError("Chọn ít nhất một vị trí công việc");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await workerApi.updateProfile({
        preferredPositionIds: selectedItems.map((item) => item.id),
        preferredIndustryIds: [
          ...new Set(selectedItems.map((item) => item.industryId)),
        ],
      });
      navigate("/onboarding/worker/locations");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lưu thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <WorkerOnboardingChrome
      step={2}
      total={4}
      title="Ngành nghề & Vị trí"
      subtitle={`Chọn tối đa ${maxPositions} vị trí — có thể thuộc các ngành nghề khác nhau.`}
      showBack
      onBack={() => navigate("/onboarding/worker/personal")}
      onNext={handleNext}
      loading={loading}
      nextDisabled={selectedItems.length === 0}
    >
      <div className="flex flex-col gap-8">
        <OnboardingSelectField
          label="Ngành nghề"
          id="industry"
          value={industryId}
          onChange={(e) => setIndustryId(e.target.value)}
        >
          <option value="" disabled>
            Chọn ngành nghề
          </option>
          {industries.map((industry) => (
            <option key={industry.id} value={industry.id}>
              {industry.name}
            </option>
          ))}
        </OnboardingSelectField>

        {selectedItems.length > 0 ? (
          <div>
            <div className="mb-3 flex items-end justify-between gap-4">
              <p className="text-sm font-semibold text-primary">Đã chọn</p>
              <p className="shrink-0 text-sm text-on-surface-variant">
                {selectedItems.length}/{maxPositions}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => removeSelected(item.id)}
                  className="onboarding-position-chip selected max-w-full"
                  title="Bỏ chọn"
                >
                  <span className="min-w-0 text-left leading-snug">
                    <span className="block truncate">{item.name}</span>
                    <span className="block text-[11px] font-normal opacity-80">
                      {item.industryName}
                    </span>
                  </span>
                  <LucideIcon
                    name="close"
                    size={16}
                    className="shrink-0 text-on-primary"
                  />
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {industryId ? (
          <div>
            <div className="mb-4 flex items-end justify-between gap-4">
              <p className="text-sm font-semibold text-primary">
                Vị trí công việc
                {selectedIndustry ? ` (${selectedIndustry.name})` : ""}
              </p>
              <p className="shrink-0 text-sm text-on-surface-variant">
                {selectedItems.length}/{maxPositions} đã chọn
              </p>
            </div>

            {loadingPositions ? (
              <p className="text-sm text-on-surface-variant">Đang tải vị trí...</p>
            ) : positions.length === 0 ? (
              <p className="text-sm text-on-surface-variant">
                Chưa có vị trí cho ngành nghề này.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {positions.map((position) => {
                  const active = selectedItems.some((item) => item.id === position.id);
                  const atLimit =
                    !active && selectedItems.length >= maxPositions;
                  return (
                    <button
                      key={position.id}
                      type="button"
                      disabled={atLimit}
                      onClick={() => toggle(position)}
                      className={`onboarding-position-chip ${
                        active ? "selected" : "unselected"
                      } ${atLimit ? "cursor-not-allowed opacity-50" : ""}`}
                    >
                      <span className="leading-snug">{position.name}</span>
                      {active ? (
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/25">
                          <LucideIcon
                            name="check"
                            size={16}
                            className="text-on-primary"
                            filled
                          />
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : null}

        {error ? <p className="text-sm text-error">{error}</p> : null}
      </div>
    </WorkerOnboardingChrome>
  );
}
