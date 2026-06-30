import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Save } from "lucide-react";
import { ProfileLayout } from "@/components/layout/ProfileLayout";
import { useAuth } from "@/hooks/useAuth";
import { workerApi, type WorkerProfile } from "@/lib/api/worker.api";
import { userApi } from "@/lib/api/user.api";
import { mediaUrl } from "@/lib/media";

const WEEKDAY_LABELS = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-bold uppercase text-slate-500">
      {children}
    </span>
  );
}

export function WorkerProfilePage() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState<WorkerProfile | null>(null);
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [bio, setBio] = useState("");
  const [expectedSalary, setExpectedSalary] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  useEffect(() => {
    if (user) {
      setFullName(user.fullName ?? "");
      setDateOfBirth(user.dateOfBirth ?? "");
    }

    workerApi
      .getProfile()
      .then((data) => {
        setProfile(data);
        setBio(data.bio ?? "");
        setExpectedSalary(
          data.expectedSalary != null ? String(data.expectedSalary) : "",
        );
      })
      .catch(() => setError("Chưa có hồ sơ người lao động."))
      .finally(() => setLoading(false));
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSaved("");

    try {
      const updatedUser = await userApi.updateMe({
        fullName: fullName.trim(),
        dateOfBirth: dateOfBirth || undefined,
      });
      setUser(updatedUser);

      const updatedProfile = await workerApi.updateProfile({
        bio: bio.trim() || undefined,
        expectedSalary: expectedSalary ? Number(expectedSalary) : undefined,
      });
      setProfile(updatedProfile);
      setSaved("Đã lưu thông tin cá nhân.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không lưu được hồ sơ.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProfileLayout title="Thông tin cá nhân">
      <div className="mx-auto max-w-[920px] space-y-5 px-4 pb-10">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              {mediaUrl(user?.avatarUrl) ? (
                <img
                  src={mediaUrl(user?.avatarUrl)!}
                  alt="Ảnh đại diện"
                  className="h-20 w-20 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-2xl font-bold text-[#0A4B3E]">
                  {user?.fullName?.[0] ?? "W"}
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-[#0A4B3E]">
                  Hồ sơ người lao động
                </p>
                <h1 className="mt-1 text-2xl font-bold text-slate-950">
                  {user?.fullName || "Thông tin cá nhân"}
                </h1>
                <p className="mt-1 text-sm text-slate-500">{user?.email}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving || loading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#00B14F] px-4 text-sm font-bold text-white shadow-sm hover:bg-[#009643] disabled:pointer-events-none disabled:bg-slate-200 disabled:text-slate-500"
            >
              <Save size={16} />
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-950">
              Thông tin cơ bản
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5">
                <FieldLabel>Họ và tên</FieldLabel>
                <input
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-[#009643] focus:ring-2 focus:ring-emerald-100"
                />
              </label>
              <label className="space-y-1.5">
                <FieldLabel>Ngày sinh</FieldLabel>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(event) => setDateOfBirth(event.target.value)}
                  className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-[#009643] focus:ring-2 focus:ring-emerald-100"
                />
              </label>
              <label className="space-y-1.5 sm:col-span-2">
                <FieldLabel>Giới thiệu ngắn</FieldLabel>
                <textarea
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  rows={4}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#009643] focus:ring-2 focus:ring-emerald-100"
                />
              </label>
              <label className="space-y-1.5 sm:col-span-2">
                <FieldLabel>Mức lương mong muốn</FieldLabel>
                <input
                  type="number"
                  min={0}
                  value={expectedSalary}
                  onChange={(event) => setExpectedSalary(event.target.value)}
                  className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-[#009643] focus:ring-2 focus:ring-emerald-100"
                />
              </label>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-bold text-slate-950">
                Hồ sơ làm việc
              </h2>
              <Link
                to="/profile/worker/edit"
                className="text-sm font-bold text-[#0A4B3E] hover:text-[#009643]"
              >
                Chỉnh chi tiết
              </Link>
            </div>

            {loading ? (
              <p className="mt-4 text-sm text-slate-500">Đang tải...</p>
            ) : profile ? (
              <div className="mt-4 space-y-5">
                <div>
                  <p className="text-xs font-bold uppercase text-slate-500">
                    Vị trí quan tâm
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {profile.preferredPositions.length ? (
                      profile.preferredPositions.map((position) => (
                        <span
                          key={position.id}
                          className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700"
                        >
                          {position.name ?? position.id}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-500">Chưa chọn</span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase text-slate-500">
                    Khu vực
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {profile.preferredLocations.length ? (
                      profile.preferredLocations.map((location) => (
                        <span
                          key={location.id}
                          className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700"
                        >
                          {location.name ?? location.id}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-500">Chưa chọn</span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase text-slate-500">
                    Lịch rảnh
                  </p>
                  <div className="mt-2 space-y-1 text-sm text-slate-700">
                    {profile.availabilities.length ? (
                      profile.availabilities.map((item, index) => (
                        <p key={`${item.weekday}-${index}`}>
                          {WEEKDAY_LABELS[item.weekday]}: {item.startTime} -{" "}
                          {item.endTime}
                        </p>
                      ))
                    ) : (
                      <p className="text-slate-500">Chưa thiết lập</p>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        ) : null}
        {saved ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            {saved}
          </div>
        ) : null}
      </div>
    </ProfileLayout>
  );
}
