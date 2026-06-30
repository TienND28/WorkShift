import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { EmployerSidebar } from "@/components/layout/EmployerSidebar";
import {
  employerApi,
  type EmployerProfile,
  type RecruiterTitle,
} from "@/lib/api/employer.api";
import { mediaUrl } from "@/lib/media";

const recruiterTitles: { value: RecruiterTitle; label: string }[] = [
  { value: "OWNER", label: "Chủ doanh nghiệp" },
  { value: "MANAGER", label: "Quản lý" },
  { value: "HR", label: "Nhân sự" },
  { value: "OTHER", label: "Khác" },
];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-bold uppercase text-slate-500">
      {children}
    </span>
  );
}

export function EmployerProfilePage() {
  const [profile, setProfile] = useState<EmployerProfile | null>(null);
  const [recruiterName, setRecruiterName] = useState("");
  const [recruiterTitle, setRecruiterTitle] = useState<RecruiterTitle>("HR");
  const [recruiterTitleOther, setRecruiterTitleOther] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  useEffect(() => {
    employerApi
      .getProfile()
      .then((data) => {
        setProfile(data);
        setRecruiterName(data.recruiterName ?? "");
        setRecruiterTitle(data.recruiterTitle ?? "HR");
        setRecruiterTitleOther(data.recruiterTitleOther ?? "");
        setContactPhone(data.contactPhone ?? "");
        setContactEmail(data.contactEmail ?? "");
      })
      .catch(() => setError("Không tải được thông tin cá nhân."))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    setError("");
    setSaved("");

    try {
      const updated = await employerApi.updateProfile({
        businessName: profile.businessName ?? "",
        organizationType: profile.organizationType ?? "",
        ...(profile.taxCode ? { taxCode: profile.taxCode } : {}),
        recruiterName: recruiterName.trim(),
        recruiterTitle,
        ...(recruiterTitle === "OTHER" && recruiterTitleOther.trim()
          ? { recruiterTitleOther: recruiterTitleOther.trim() }
          : {}),
        address: profile.address ?? "",
        provinceId: profile.provinceId ?? "",
        districtId: profile.districtId ?? "",
        wardId: profile.wardId ?? "",
        coordinates: profile.coordinates ?? { lat: 10.7769, lng: 106.7009 },
        contactPhone: contactPhone.trim(),
        contactEmail: contactEmail.trim(),
      });
      setProfile(updated);
      setSaved("Đã lưu thông tin cá nhân.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không lưu được thông tin.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-dvh bg-white text-slate-950">
      <div className="flex">
        <EmployerSidebar />

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between gap-4 px-4 sm:px-6">
              <div>
                <p className="text-xs font-semibold text-[#0A4B3E]">
                  Tài khoản nhà tuyển dụng
                </p>
                <h1 className="text-base font-bold text-slate-950">
                  Thông tin cá nhân
                </h1>
              </div>

              <button
                type="button"
                onClick={handleSave}
                disabled={loading || saving || !profile}
                className="inline-flex h-10 items-center gap-2 rounded-md bg-[#00B14F] px-4 text-sm font-bold text-white shadow-sm hover:bg-[#009643] disabled:pointer-events-none disabled:bg-slate-200 disabled:text-slate-500"
              >
                <Save size={16} />
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </header>

          <div className="mx-auto max-w-[1180px] space-y-5 px-4 py-6 sm:px-6">
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-4">
                {mediaUrl(profile?.logo ?? null) ? (
                  <img
                    src={mediaUrl(profile?.logo ?? null)!}
                    alt="Logo doanh nghiệp"
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-100 text-xl font-bold text-[#0A4B3E]">
                    {profile?.businessName?.[0] ?? "E"}
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold text-slate-950">
                    {profile?.businessName ?? "Nhà tuyển dụng"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Thông tin người đại diện tuyển dụng trong hệ thống.
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-bold text-slate-950">
                Người phụ trách tuyển dụng
              </h2>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="space-y-1.5">
                  <FieldLabel>Họ và tên</FieldLabel>
                  <input
                    value={recruiterName}
                    onChange={(event) => setRecruiterName(event.target.value)}
                    className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-[#009643] focus:ring-2 focus:ring-emerald-100"
                  />
                </label>

                <label className="space-y-1.5">
                  <FieldLabel>Chức vụ</FieldLabel>
                  <select
                    value={recruiterTitle}
                    onChange={(event) =>
                      setRecruiterTitle(event.target.value as RecruiterTitle)
                    }
                    className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-[#009643] focus:ring-2 focus:ring-emerald-100"
                  >
                    {recruiterTitles.map((title) => (
                      <option key={title.value} value={title.value}>
                        {title.label}
                      </option>
                    ))}
                  </select>
                </label>

                {recruiterTitle === "OTHER" ? (
                  <label className="space-y-1.5">
                    <FieldLabel>Chức vụ khác</FieldLabel>
                    <input
                      value={recruiterTitleOther}
                      onChange={(event) =>
                        setRecruiterTitleOther(event.target.value)
                      }
                      className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-[#009643] focus:ring-2 focus:ring-emerald-100"
                    />
                  </label>
                ) : null}

                <label className="space-y-1.5">
                  <FieldLabel>Số điện thoại</FieldLabel>
                  <input
                    value={contactPhone}
                    onChange={(event) => setContactPhone(event.target.value)}
                    className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-[#009643] focus:ring-2 focus:ring-emerald-100"
                  />
                </label>

                <label className="space-y-1.5 md:col-span-2">
                  <FieldLabel>Email công việc</FieldLabel>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(event) => setContactEmail(event.target.value)}
                    className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-[#009643] focus:ring-2 focus:ring-emerald-100"
                  />
                  {profile?.contactEmailVerified ? (
                    <span className="block text-xs font-semibold text-[#009643]">
                      Email đã xác thực
                    </span>
                  ) : (
                    <span className="block text-xs text-slate-500">
                      Email chưa xác thực. Luồng xác thực sẽ được xử lý ở bước
                      thiết lập hoặc khi gửi thông báo tuyển dụng.
                    </span>
                  )}
                </label>
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
        </main>
      </div>
    </div>
  );
}
