import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { OnboardingLayout } from "@/features/onboarding/layout/OnboardingLayout";
import { OnboardingStepShell } from "@/features/onboarding/components/OnboardingStepShell";
import { catalogApi, type CatalogItem } from "@/lib/api/catalog.api";
import { organizationApi } from "@/lib/api/organization.api";
import {
  employerIndustryLabel,
  employerIndustryPlaceholder,
} from "@/lib/catalog-labels";
import { useAuth } from "@/hooks/useAuth";

type LocationState = { verificationLevel?: 1 | 2 };

export function EmployerOrganizationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, refreshMe } = useAuth();
  const verificationLevel =
    (location.state as LocationState | null)?.verificationLevel ?? 1;

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
  const [contactPhone, setContactPhone] = useState(user?.phone ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [taxCode, setTaxCode] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    catalogApi.getIndustries().then(setIndustries);
    catalogApi.getProvinces().then(setProvinces);
  }, []);

  useEffect(() => {
    if (!provinceId) return;
    catalogApi.getDistricts(provinceId).then(setDistricts);
  }, [provinceId]);

  useEffect(() => {
    if (!districtId) return;
    catalogApi.getWards(districtId).then(setWards);
  }, [districtId]);

  const handleFinish = async () => {
    if (
      !name.trim() ||
      !organizationType ||
      !address.trim() ||
      !provinceId ||
      !districtId ||
      !wardId ||
      !contactPhone ||
      !email
    ) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const org = await organizationApi.create({
        name: name.trim(),
        organizationType,
        address: address.trim(),
        provinceId,
        districtId,
        wardId,
        contactPhone,
        email,
        verificationLevel,
        ...(taxCode.trim() ? { taxCode: taxCode.trim() } : {}),
      });

      if (logoFile) {
        await organizationApi.uploadLogo(org.id, logoFile);
      }

      await refreshMe();
      navigate("/", { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Tạo tổ chức thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout
      step={2}
      total={2}
      title="Thông tin tổ chức"
      subtitle={
        verificationLevel === 2
          ? "Thiết lập hồ sơ doanh nghiệp của bạn."
          : "Thiết lập hồ sơ tuyển dụng nhỏ của bạn."
      }
    >
      <OnboardingStepShell
        onBack={() => navigate("/onboarding/employer/scale")}
        onNext={handleFinish}
        nextLabel="Hoàn tất"
        loading={loading}
      >
        <div className="space-y-4 max-h-[28rem] overflow-y-auto pr-1">
          <label className="block text-sm font-medium">
            Tên tổ chức / quán / công ty
            <input
              className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-2.5"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <label className="block text-sm font-medium">
            {employerIndustryLabel}
            <select
              className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-2.5"
              value={organizationType}
              onChange={(e) => setOrganizationType(e.target.value)}
            >
              <option value="">-- {employerIndustryPlaceholder} --</option>
              {industries.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium">
            Địa chỉ
            <input
              className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-2.5"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </label>

          <select
            className="w-full rounded-xl border border-neutral-300 px-4 py-2.5"
            value={provinceId}
            onChange={(e) => {
              setProvinceId(e.target.value);
              setDistrictId("");
              setWardId("");
            }}
          >
            <option value="">Tỉnh / Thành phố</option>
            {provinces.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            className="w-full rounded-xl border border-neutral-300 px-4 py-2.5"
            value={districtId}
            disabled={!provinceId}
            onChange={(e) => {
              setDistrictId(e.target.value);
              setWardId("");
            }}
          >
            <option value="">Quận / Huyện</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            className="w-full rounded-xl border border-neutral-300 px-4 py-2.5"
            value={wardId}
            disabled={!districtId}
            onChange={(e) => setWardId(e.target.value)}
          >
            <option value="">Phường / Xã</option>
            {wards.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>

          <label className="block text-sm font-medium">
            Số điện thoại liên hệ
            <input
              className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-2.5"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
            />
          </label>

          <label className="block text-sm font-medium">
            Email
            <input
              type="email"
              className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-2.5"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          {verificationLevel === 2 ? (
            <label className="block text-sm font-medium">
              Mã số thuế (tuỳ chọn)
              <input
                className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-2.5"
                value={taxCode}
                onChange={(e) => setTaxCode(e.target.value)}
              />
            </label>
          ) : null}

          <label className="block text-sm font-medium">
            Logo (tuỳ chọn)
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="mt-1 w-full text-sm"
              onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      </OnboardingStepShell>
    </OnboardingLayout>
  );
}
