import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ProfileLayout } from "@/components/layout/ProfileLayout";
import { Button } from "@/components/ui/Button";
import { catalogApi, type CatalogItem } from "@/lib/api/catalog.api";
import {
  organizationApi,
  type Organization,
} from "@/lib/api/organization.api";
import { employerIndustryLabel } from "@/lib/catalog-labels";
import { mediaUrl } from "@/lib/media";

export function OrganizationEditPage() {
  const { organizationId } = useParams<{ organizationId: string }>();
  const navigate = useNavigate();
  const [org, setOrg] = useState<Organization | null>(null);
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
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organizationId) return;
    catalogApi.getIndustries().then(setIndustries);
    catalogApi.getProvinces().then(setProvinces);

    organizationApi.getById(organizationId).then((data) => {
      setOrg(data);
      setName(data.name);
      setOrganizationType(data.organizationType.id);
      setAddress(data.address);
      setProvinceId(data.provinceId);
      setDistrictId(data.districtId);
      setWardId(data.wardId);
      setContactPhone(data.contactPhone);
      setEmail(data.email);
      setDescription(data.description ?? "");
      setTaxCode(data.taxCode ?? "");
    });
  }, [organizationId]);

  useEffect(() => {
    if (!provinceId) return;
    catalogApi.getDistricts(provinceId).then(setDistricts);
  }, [provinceId]);

  useEffect(() => {
    if (!districtId) return;
    catalogApi.getWards(districtId).then(setWards);
  }, [districtId]);

  const handleSave = async () => {
    if (!organizationId) return;
    setLoading(true);
    setError(null);
    try {
      await organizationApi.update(organizationId, {
        name: name.trim(),
        organizationType,
        address: address.trim(),
        provinceId,
        districtId,
        wardId,
        contactPhone,
        email,
        description: description || undefined,
        taxCode: taxCode || undefined,
      });
      if (logoFile) {
        await organizationApi.uploadLogo(organizationId, logoFile);
      }
      navigate("/profile/employer", { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lưu thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (!org) {
    return (
      <ProfileLayout title="Chỉnh sửa tổ chức" backTo="/profile/employer">
        <p className="text-on-surface-variant">Đang tải...</p>
      </ProfileLayout>
    );
  }

  return (
    <ProfileLayout
      title="Chỉnh sửa tổ chức"
      backTo="/profile/employer"
      actions={
        <Button className="!px-4 !py-2 text-sm" loading={loading} onClick={handleSave}>
          Lưu
        </Button>
      }
    >
      <div className="onboarding-card space-y-4">
        {mediaUrl(org.logo) ? (
          <img
            src={mediaUrl(org.logo)!}
            alt=""
            className="h-16 w-16 rounded-xl object-cover"
          />
        ) : null}

        <label className="flex flex-col gap-2">
          <span className="onboarding-label">Tên tổ chức</span>
          <input
            className="onboarding-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="onboarding-label">{employerIndustryLabel}</span>
          <select
            className="onboarding-select"
            value={organizationType}
            onChange={(e) => setOrganizationType(e.target.value)}
          >
            {industries.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="onboarding-label">Mô tả</span>
          <textarea
            className="onboarding-input min-h-[96px] resize-y py-3"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="onboarding-label">Địa chỉ</span>
          <input
            className="onboarding-input"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </label>

        <select
          className="onboarding-select"
          value={provinceId}
          onChange={(e) => {
            setProvinceId(e.target.value);
            setDistrictId("");
            setWardId("");
          }}
        >
          {provinces.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <select
          className="onboarding-select"
          value={districtId}
          onChange={(e) => {
            setDistrictId(e.target.value);
            setWardId("");
          }}
        >
          {districts.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        <select
          className="onboarding-select"
          value={wardId}
          onChange={(e) => setWardId(e.target.value)}
        >
          {wards.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>

        <label className="flex flex-col gap-2">
          <span className="onboarding-label">Số điện thoại</span>
          <input
            className="onboarding-input"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="onboarding-label">Email liên hệ</span>
          <input
            type="email"
            className="onboarding-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="onboarding-label">Mã số thuế</span>
          <input
            className="onboarding-input"
            value={taxCode}
            onChange={(e) => setTaxCode(e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="onboarding-label">Logo mới</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="mt-1 w-full text-sm"
            onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
    </ProfileLayout>
  );
}
