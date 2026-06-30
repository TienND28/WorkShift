import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProfileLayout } from "@/components/layout/ProfileLayout";
import { Button } from "@/components/ui/Button";
import { AvatarPicker } from "@/features/onboarding/components/AvatarPicker";
import {
  OnboardingFormField,
  OnboardingSelectField,
} from "@/features/onboarding/components/OnboardingFormField";
import { useAuth } from "@/hooks/useAuth";
import { useWorkerProfileLimits } from "@/hooks/useWorkerProfileLimits";
import {
  catalogApi,
  type CatalogItem,
  type PositionItem,
} from "@/lib/api/catalog.api";
import { userApi } from "@/lib/api/user.api";
import {
  workerApi,
  type WorkerAvailability,
  type WorkerProfile,
} from "@/lib/api/worker.api";
import { mediaUrl } from "@/lib/media";

const WEEKDAYS = [
  { value: 1, label: "Thứ 2" },
  { value: 2, label: "Thứ 3" },
  { value: 3, label: "Thứ 4" },
  { value: 4, label: "Thứ 5" },
  { value: 5, label: "Thứ 6" },
  { value: 6, label: "Thứ 7" },
  { value: 0, label: "Chủ nhật" },
];

export function WorkerProfileEditPage() {
  const navigate = useNavigate();
  const { user, setUser, refreshMe } = useAuth();
  const { limits } = useWorkerProfileLimits();
  const maxProvinces = limits.preferredProvinces;
  const maxPositions = limits.preferredPositions;
  const maxDistricts = limits.preferredDistricts;
  const maxAvailabilities = limits.availabilities;
  const [tab, setTab] = useState<"personal" | "jobs" | "areas" | "time">("personal");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [bio, setBio] = useState("");
  const [expectedSalary, setExpectedSalary] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [industries, setIndustries] = useState<CatalogItem[]>([]);
  const [industryId, setIndustryId] = useState("");
  const [positions, setPositions] = useState<PositionItem[]>([]);
  const [loadingPositions, setLoadingPositions] = useState(false);
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);

  const [provinces, setProvinces] = useState<CatalogItem[]>([]);
  const [districts, setDistricts] = useState<CatalogItem[]>([]);
  const [districtProvinceMap, setDistrictProvinceMap] = useState<
    Record<string, string>
  >({});
  const [provinceId, setProvinceId] = useState("");
  const [selectedProvinces, setSelectedProvinces] = useState<string[]>([]);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);

  const [slots, setSlots] = useState<WorkerAvailability[]>([
    { weekday: 1, startTime: "08:00", endTime: "12:00" },
  ]);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setDateOfBirth(user.dateOfBirth ?? "");
      setAvatarPreview(mediaUrl(user.avatarUrl));
    }
    catalogApi.getIndustries().then((items) => {
      setIndustries(items);
      if (items.length > 0) setIndustryId(items[0].id);
    });
    catalogApi.getProvinces().then(setProvinces);

    workerApi.getProfile().then((p: WorkerProfile) => {
      setBio(p.bio ?? "");
      setExpectedSalary(
        p.expectedSalary != null ? String(p.expectedSalary) : "",
      );
      setSelectedPositions(p.preferredPositions.map((x) => x.id));
      setSelectedDistricts(p.preferredLocations.map((x) => x.id));
      if (p.availabilities.length > 0) setSlots(p.availabilities);
      if (p.preferredIndustries.length > 0) {
        setIndustryId(p.preferredIndustries[0].id);
      }
    });
  }, [user]);

  useEffect(() => {
    if (!industryId) {
      setPositions([]);
      return;
    }
    setLoadingPositions(true);
    catalogApi
      .getPositions(industryId)
      .then(setPositions)
      .finally(() => setLoadingPositions(false));
  }, [industryId]);

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
    setSelectedDistricts((prev) =>
      prev.filter((districtId) => districtProvinceMap[districtId] !== removeId),
    );
  };

  const savePersonal = async () => {
    setLoading(true);
    setError(null);
    try {
      let updated = await userApi.updateMe({
        fullName: fullName.trim(),
        dateOfBirth: dateOfBirth || undefined,
      });
      if (avatarFile) updated = await userApi.uploadAvatar(avatarFile);
      setUser(updated);
      if (bio || expectedSalary) {
        await workerApi.updateProfile({
          bio: bio || undefined,
          expectedSalary: expectedSalary ? Number(expectedSalary) : undefined,
        });
      }
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lưu thất bại");
    } finally {
      setLoading(false);
    }
  };

  const saveJobs = async () => {
    if (selectedPositions.length === 0) {
      setError("Chọn ít nhất một vị trí công việc");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await workerApi.updateProfile({
        preferredPositionIds: selectedPositions,
      });
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lưu thất bại");
    } finally {
      setLoading(false);
    }
  };

  const saveAreas = async () => {
    setLoading(true);
    try {
      await workerApi.updateProfile({ preferredDistrictIds: selectedDistricts });
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lưu thất bại");
    } finally {
      setLoading(false);
    }
  };

  const saveTime = async () => {
    setLoading(true);
    try {
      await workerApi.updateProfile({ availabilities: slots });
      await refreshMe();
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lưu thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    setSaved(false);
    if (tab === "personal") return savePersonal();
    if (tab === "jobs") return saveJobs();
    if (tab === "areas") return saveAreas();
    return saveTime();
  };

  const tabs = [
    { id: "personal" as const, label: "Cá nhân" },
    { id: "jobs" as const, label: "Công việc" },
    { id: "areas" as const, label: "Khu vực" },
    { id: "time" as const, label: "Lịch rảnh" },
  ];

  return (
    <ProfileLayout
      title="Chỉnh sửa hồ sơ"
      backTo="/profile/worker"
      actions={
        <Button
          className="!px-4 !py-2 text-sm"
          loading={loading}
          onClick={handleSave}
        >
          Lưu
        </Button>
      }
    >
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={tab === t.id ? "profile-tab profile-tab-active" : "profile-tab"}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="onboarding-card">
        {tab === "personal" ? (
          <div className="space-y-4">
            <AvatarPicker
              previewUrl={avatarPreview}
              onSelect={(f) => {
                setAvatarFile(f);
                setAvatarPreview(URL.createObjectURL(f));
              }}
            />
            <OnboardingFormField
              label="Họ và tên"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <OnboardingFormField
              label="Ngày sinh"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />
            <div className="flex flex-col gap-2">
              <label className="onboarding-label" htmlFor="bio">
                Giới thiệu ngắn
              </label>
              <textarea
                id="bio"
                className="onboarding-input min-h-[96px] resize-y py-3"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
            <OnboardingFormField
              label="Mức lương mong muốn (VNĐ)"
              type="number"
              min={0}
              value={expectedSalary}
              onChange={(e) => setExpectedSalary(e.target.value)}
            />
          </div>
        ) : null}

        {tab === "jobs" ? (
          <div className="space-y-4">
            <OnboardingSelectField
              label="Ngành nghề"
              value={industryId}
              onChange={(e) => setIndustryId(e.target.value)}
            >
              <option value="">Chọn ngành nghề</option>
              {industries.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </OnboardingSelectField>

            {selectedPositions.length > 0 ? (
              <p className="text-sm text-on-surface-variant">
                Đã chọn {selectedPositions.length}/{maxPositions} vị trí
              </p>
            ) : null}

            {loadingPositions ? (
              <p className="text-sm text-on-surface-variant">Đang tải vị trí...</p>
            ) : (
              <div className="max-h-96 space-y-2 overflow-y-auto">
                {positions.map((p) => {
                  const active = selectedPositions.includes(p.id);
                  const atLimit =
                    !active && selectedPositions.length >= maxPositions;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      disabled={atLimit}
                      onClick={() =>
                        setSelectedPositions((prev) =>
                          prev.includes(p.id)
                            ? prev.filter((x) => x !== p.id)
                            : prev.length >= maxPositions
                              ? prev
                              : [...prev, p.id],
                        )
                      }
                      className={
                        active
                          ? "profile-option profile-option-active"
                          : `profile-option ${atLimit ? "cursor-not-allowed opacity-50" : ""}`
                      }
                    >
                      <span className="block">{p.name}</span>
                      {p.industry?.name ? (
                        <span className="block text-xs opacity-80">
                          {p.industry.name}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : null}

        {tab === "areas" ? (
          <div className="space-y-3">
            <OnboardingSelectField
              label={`Tỉnh / Thành phố (${selectedProvinces.length}/${maxProvinces})`}
              value={provinceId}
              onChange={(e) => {
                const nextId = e.target.value;
                setProvinceId(nextId);
                addProvince(nextId);
              }}
            >
              <option value="">Chọn tỉnh/thành</option>
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
            <div className="max-h-64 space-y-2 overflow-y-auto">
              {districts.map((d) => {
                const active = selectedDistricts.includes(d.id);
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() =>
                      setSelectedDistricts((prev) =>
                        prev.includes(d.id)
                          ? prev.filter((x) => x !== d.id)
                          : [...prev, d.id].slice(0, maxDistricts),
                      )
                    }
                    className={active ? "profile-option profile-option-active" : "profile-option"}
                  >
                    {d.name}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {tab === "time" ? (
          <div className="space-y-4">
            {slots.map((slot, index) => (
              <div key={index} className="rounded-xl border border-border-subtle bg-surface-container-low p-3">
                <select
                  className="onboarding-select mb-2 h-12"
                  value={slot.weekday}
                  onChange={(e) =>
                    setSlots((prev) =>
                      prev.map((s, i) =>
                        i === index
                          ? { ...s, weekday: Number(e.target.value) }
                          : s,
                      ),
                    )
                  }
                >
                  {WEEKDAYS.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <input
                    type="time"
                    className="onboarding-input h-12 flex-1"
                    value={slot.startTime}
                    onChange={(e) =>
                      setSlots((prev) =>
                        prev.map((s, i) =>
                          i === index ? { ...s, startTime: e.target.value } : s,
                        ),
                      )
                    }
                  />
                  <input
                    type="time"
                    className="onboarding-input h-12 flex-1"
                    value={slot.endTime}
                    onChange={(e) =>
                      setSlots((prev) =>
                        prev.map((s, i) =>
                          i === index ? { ...s, endTime: e.target.value } : s,
                        ),
                      )
                    }
                  />
                </div>
              </div>
            ))}
            {slots.length < maxAvailabilities ? (
              <button
                type="button"
                className="profile-link"
                onClick={() =>
                  setSlots((prev) => [
                    ...prev,
                    { weekday: 1, startTime: "08:00", endTime: "12:00" },
                  ])
                }
              >
                + Thêm khung giờ
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      {saved ? (
        <p className="mt-4 text-sm text-green-600">Đã lưu thay đổi.</p>
      ) : null}

      <Button
        className="mt-6 w-full"
        variant="ghost"
        onClick={() => navigate("/profile/worker")}
      >
        Xem hồ sơ
      </Button>
    </ProfileLayout>
  );
}
