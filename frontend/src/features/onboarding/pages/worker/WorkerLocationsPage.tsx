import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { WorkerOnboardingChrome } from "@/features/onboarding/components/WorkerOnboardingChrome";
import { OnboardingSelectField } from "@/features/onboarding/components/OnboardingFormField";
import { catalogApi, type CatalogItem } from "@/lib/api/catalog.api";
import { workerApi } from "@/lib/api/worker.api";
import { useWorkerProfileLimits } from "@/hooks/useWorkerProfileLimits";

const REMOTE_PREF_KEY = "workshift.worker.openToRemote";

export function WorkerLocationsPage() {
  const navigate = useNavigate();
  const { limits } = useWorkerProfileLimits();
  const maxProvinces = limits.preferredProvinces;
  const maxDistricts = limits.preferredDistricts;
  const [provinces, setProvinces] = useState<CatalogItem[]>([]);
  const [districts, setDistricts] = useState<CatalogItem[]>([]);
  const [districtProvinceMap, setDistrictProvinceMap] = useState<
    Record<string, string>
  >({});
  const [provinceId, setProvinceId] = useState("");
  const [selectedProvinces, setSelectedProvinces] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [openToRemote, setOpenToRemote] = useState(
    () => sessionStorage.getItem(REMOTE_PREF_KEY) === "true",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    catalogApi.getProvinces().then(setProvinces);
  }, []);

  useEffect(() => {
    if (selectedProvinces.length === 0) {
      setDistricts([]);
      setDistrictProvinceMap({});
      return;
    }

    Promise.all(selectedProvinces.map((id) => catalogApi.getDistricts(id))).then(
      (results) => {
        const byId = new Map<string, CatalogItem>();
        const map: Record<string, string> = {};

        results.forEach((items, idx) => {
          const pid = selectedProvinces[idx];
          items.forEach((item) => {
            byId.set(item.id, item);
            map[item.id] = pid;
          });
        });

        setDistricts(Array.from(byId.values()));
        setDistrictProvinceMap(map);
      },
    );
  }, [selectedProvinces]);

  const addProvince = (nextProvinceId: string) => {
    if (!nextProvinceId) return;
    setSelectedProvinces((prev) => {
      if (prev.includes(nextProvinceId)) return prev;
      if (prev.length >= maxProvinces) return prev;
      return [...prev, nextProvinceId];
    });
    setProvinceId("");
  };

  const removeProvince = (removeId: string) => {
    setSelectedProvinces((prev) => prev.filter((id) => id !== removeId));
    setSelected((prev) =>
      prev.filter((districtId) => districtProvinceMap[districtId] !== removeId),
    );
  };

  const toggleDistrict = (id: string) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id].slice(0, maxDistricts),
    );
  };

  const handleRemoteToggle = () => {
    const next = !openToRemote;
    setOpenToRemote(next);
    sessionStorage.setItem(REMOTE_PREF_KEY, String(next));
  };

  const handleNext = async () => {
    if (selected.length === 0 && !openToRemote) {
      setError("Chọn ít nhất một quận/huyện hoặc bật làm việc từ xa");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (selected.length > 0) {
        await workerApi.updateProfile({ preferredDistrictIds: selected });
      }
      navigate("/onboarding/worker/availability");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lưu thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <WorkerOnboardingChrome
      step={3}
      total={4}
      title="Địa điểm làm việc"
      subtitle="Chọn khu vực bạn mong muốn tìm việc."
      centeredTitle
      showBack
      onBack={() => navigate("/onboarding/worker/positions")}
      onNext={handleNext}
      nextDisabled={selected.length === 0 && !openToRemote}
      loading={loading}
    >
      <div className="flex flex-1 flex-col gap-6">
        <OnboardingSelectField
          label={`Tỉnh / Thành phố (${selectedProvinces.length}/${maxProvinces})`}
          id="province"
          value={provinceId}
          onChange={(e) => {
            const nextId = e.target.value;
            setProvinceId(nextId);
            addProvince(nextId);
          }}
        >
          <option value="">Chọn Tỉnh / Thành phố</option>
          {provinces.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </OnboardingSelectField>

        {selectedProvinces.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedProvinces.map((id) => {
              const province = provinces.find((p) => p.id === id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => removeProvince(id)}
                  className="rounded-full border border-border-subtle bg-surface-container-low px-3 py-1 text-xs text-primary"
                  title="Bỏ tỉnh này"
                >
                  {province?.name ?? id} x
                </button>
              );
            })}
          </div>
        ) : null}

        {selectedProvinces.length > 0 ? (
          <div className="flex flex-col gap-2">
            <span className="onboarding-label text-primary">Quận / Huyện</span>
            <div className="max-h-48 space-y-2 overflow-y-auto">
              {districts.length === 0 ? (
                <p className="text-sm text-on-surface-variant">Đang tải...</p>
              ) : (
                districts.map((d) => {
                  const active = selected.includes(d.id);
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => toggleDistrict(d.id)}
                      className={`w-full rounded-xl px-4 py-3 text-left text-base transition ${
                        active
                          ? "border border-primary bg-background-light"
                          : "bg-surface-container-low hover:bg-surface-container-high"
                      }`}
                    >
                      {d.name}
                    </button>
                  );
                })
              )}
            </div>
            <p className="text-xs text-on-surface-variant">
              Đã chọn: {selected.length}/{maxDistricts} khu vực
            </p>
          </div>
        ) : (
          <OnboardingSelectField
            label="Quận / Huyện"
            id="district"
            disabled
            value=""
          >
            <option value="">Vui lòng thêm ít nhất 1 tỉnh/thành trước</option>
          </OnboardingSelectField>
        )}

        <button
          type="button"
          onClick={handleRemoteToggle}
          className="mt-2 flex cursor-pointer items-center justify-between rounded-xl border border-transparent bg-surface-container-low p-4 transition-colors hover:border-border-subtle"
        >
          <div className="flex flex-col text-left">
            <span className="text-sm font-semibold text-primary">
              Làm việc từ xa (Remote)
            </span>
            <span className="mt-1 text-xs text-on-surface-variant">
              Tôi sẵn sàng cho các cơ hội làm việc online (sẽ hỗ trợ khi mở rộng
              tuyển dụng dài hạn)
            </span>
          </div>
          <div
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
              openToRemote ? "bg-primary" : "bg-surface-variant"
            }`}
            aria-hidden
          >
            <div
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                openToRemote ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </div>
        </button>

        {error ? <p className="text-sm text-error">{error}</p> : null}
      </div>
    </WorkerOnboardingChrome>
  );
}
