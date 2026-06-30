import { useEffect, useState } from "react";
import { Save, Upload } from "lucide-react";
import { EmployerSidebar } from "@/components/layout/EmployerSidebar";
import { catalogApi, type CatalogItem } from "@/lib/api/catalog.api";
import { organizationApi, type Organization } from "@/lib/api/organization.api";
import { employerIndustryLabel } from "@/lib/catalog-labels";
import { mediaUrl } from "@/lib/media";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-bold uppercase text-slate-500">
      {children}
    </span>
  );
}

export function OrganizationProfilePage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState("");
  const [industries, setIndustries] = useState<CatalogItem[]>([]);
  const [provinces, setProvinces] = useState<CatalogItem[]>([]);
  const [districts, setDistricts] = useState<CatalogItem[]>([]);
  const [wards, setWards] = useState<CatalogItem[]>([]);

  const [name, setName] = useState("");
  const [organizationType, setOrganizationType] = useState("");
  const [address, setAddress] = useState("");
  const [provinceId, setProvinceId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [wardId, setWardId] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [taxCode, setTaxCode] = useState("");
  const [logo, setLogo] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  const selectedOrganization = organizations.find(
    (organization) => organization.id === selectedOrganizationId,
  );

  useEffect(() => {
    Promise.all([
      organizationApi.listMine(),
      catalogApi.getIndustries(),
      catalogApi.getProvinces(),
    ])
      .then(([orgs, industryItems, provinceItems]) => {
        setOrganizations(orgs);
        setIndustries(industryItems);
        setProvinces(provinceItems);
        const firstOrg = orgs[0];
        if (firstOrg) {
          setSelectedOrganizationId(firstOrg.id);
          fillForm(firstOrg);
        }
      })
      .catch(() => setError("Không tải được thông tin doanh nghiệp."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!provinceId) {
      setDistricts([]);
      setWards([]);
      return;
    }
    catalogApi.getDistricts(provinceId).then(setDistricts);
  }, [provinceId]);

  useEffect(() => {
    if (!districtId) {
      setWards([]);
      return;
    }
    catalogApi.getWards(districtId).then(setWards);
  }, [districtId]);

  const fillForm = (organization: Organization) => {
    setName(organization.name);
    setOrganizationType(organization.organizationType.id);
    setAddress(organization.address);
    setProvinceId(organization.provinceId);
    setDistrictId(organization.districtId);
    setWardId(organization.wardId);
    setContactPhone(organization.contactPhone);
    setEmail(organization.email);
    setDescription(organization.description ?? "");
    setTaxCode(organization.taxCode ?? "");
    setLogo(organization.logo);
    setLogoFile(null);
  };

  const handleSave = async () => {
    if (!selectedOrganizationId) return;

    setSaving(true);
    setError("");
    setSaved("");

    try {
      const updated = await organizationApi.update(selectedOrganizationId, {
        name: name.trim(),
        organizationType,
        address: address.trim(),
        provinceId,
        districtId,
        wardId,
        contactPhone: contactPhone.trim(),
        email: email.trim(),
        description: description.trim() || undefined,
        taxCode: taxCode.trim() || undefined,
      });
      if (logoFile) {
        const uploaded = await organizationApi.uploadLogo(
          selectedOrganizationId,
          logoFile,
        );
        setLogo(uploaded.logo);
      }
      setOrganizations((current) =>
        current.map((organization) =>
          organization.id === selectedOrganizationId ? updated : organization,
        ),
      );
      setSaved("Đã lưu thông tin doanh nghiệp.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không lưu được thông tin.",
      );
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
                  Hồ sơ doanh nghiệp
                </p>
                <h1 className="text-base font-bold text-slate-950">
                  Thông tin doanh nghiệp
                </h1>
              </div>

              <button
                type="button"
                onClick={handleSave}
                disabled={loading || saving || !selectedOrganization}
                className="inline-flex h-10 items-center gap-2 rounded-md bg-[#00B14F] px-4 text-sm font-bold text-white shadow-sm hover:bg-[#009643] disabled:pointer-events-none disabled:bg-slate-200 disabled:text-slate-500"
              >
                <Save size={16} />
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </header>

          <div className="mx-auto max-w-[1180px] space-y-5 px-4 py-6 sm:px-6">
            <section className="grid gap-5 lg:grid-cols-[280px_1fr]">
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-5">
                  <h2 className="text-xl font-bold text-slate-950">
                    {selectedOrganization?.name ?? "Doanh nghiệp"}
                  </h2>
                </div>

                <div className="flex flex-col items-center">
                  {mediaUrl(logo) ? (
                    <img
                      src={mediaUrl(logo)!}
                      alt="Logo doanh nghiệp"
                      className="h-32 w-32 rounded-xl border border-slate-200 object-cover"
                    />
                  ) : (
                    <div className="flex h-32 w-32 items-center justify-center rounded-xl bg-slate-100 text-3xl font-bold text-[#0A4B3E]">
                      {name[0] ?? "D"}
                    </div>
                  )}

                  <label className="mt-4 inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
                    <Upload size={16} />
                    Đổi logo
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(event) =>
                        setLogoFile(event.target.files?.[0] ?? null)
                      }
                    />
                  </label>

                  {logoFile && (
                    <p className="mt-2 max-w-[220px] truncate text-center text-xs text-slate-500">
                      Đã chọn: {logoFile.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-1.5 md:col-span-2">
                    <FieldLabel>Tên doanh nghiệp</FieldLabel>
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-[#009643] focus:ring-2 focus:ring-emerald-100"
                    />
                  </label>

                  <label className="space-y-1.5">
                    <FieldLabel>{employerIndustryLabel}</FieldLabel>
                    <select
                      value={organizationType}
                      onChange={(event) =>
                        setOrganizationType(event.target.value)
                      }
                      className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-[#009643] focus:ring-2 focus:ring-emerald-100"
                    >
                      {industries.map((industry) => (
                        <option key={industry.id} value={industry.id}>
                          {industry.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-1.5">
                    <FieldLabel>Mã số thuế</FieldLabel>
                    <input
                      value={taxCode}
                      onChange={(event) => setTaxCode(event.target.value)}
                      className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-[#009643] focus:ring-2 focus:ring-emerald-100"
                    />
                  </label>

                  <label className="space-y-1.5 md:col-span-2">
                    <FieldLabel>Mô tả</FieldLabel>
                    <textarea
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      rows={4}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#009643] focus:ring-2 focus:ring-emerald-100"
                    />
                  </label>

                  <label className="space-y-1.5">
                    <FieldLabel>Số điện thoại</FieldLabel>
                    <input
                      value={contactPhone}
                      onChange={(event) => setContactPhone(event.target.value)}
                      className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-[#009643] focus:ring-2 focus:ring-emerald-100"
                    />
                  </label>

                  <label className="space-y-1.5">
                    <FieldLabel>Email liên hệ</FieldLabel>
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-[#009643] focus:ring-2 focus:ring-emerald-100"
                    />
                  </label>
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-bold text-slate-950">
                Địa điểm doanh nghiệp
              </h2>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <label className="space-y-1.5 md:col-span-3">
                  <FieldLabel>Địa chỉ chi tiết</FieldLabel>
                  <input
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-[#009643] focus:ring-2 focus:ring-emerald-100"
                  />
                </label>

                <label className="space-y-1.5">
                  <FieldLabel>Tỉnh/Thành phố</FieldLabel>
                  <select
                    value={provinceId}
                    onChange={(event) => {
                      setProvinceId(event.target.value);
                      setDistrictId("");
                      setWardId("");
                    }}
                    className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-[#009643] focus:ring-2 focus:ring-emerald-100"
                  >
                    <option value="">Chọn tỉnh/thành</option>
                    {provinces.map((province) => (
                      <option key={province.id} value={province.id}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1.5">
                  <FieldLabel>Quận/Huyện</FieldLabel>
                  <select
                    value={districtId}
                    onChange={(event) => {
                      setDistrictId(event.target.value);
                      setWardId("");
                    }}
                    className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-[#009643] focus:ring-2 focus:ring-emerald-100"
                  >
                    <option value="">Chọn quận/huyện</option>
                    {districts.map((district) => (
                      <option key={district.id} value={district.id}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1.5">
                  <FieldLabel>Phường/Xã</FieldLabel>
                  <select
                    value={wardId}
                    onChange={(event) => setWardId(event.target.value)}
                    className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-[#009643] focus:ring-2 focus:ring-emerald-100"
                  >
                    <option value="">Chọn phường/xã</option>
                    {wards.map((ward) => (
                      <option key={ward.id} value={ward.id}>
                        {ward.name}
                      </option>
                    ))}
                  </select>
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
