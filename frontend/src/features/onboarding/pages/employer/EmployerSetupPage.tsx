import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { LucideIcon } from "@/components/icons/LucideIcon";
import { OnboardingLayout } from "@/features/onboarding/layout/OnboardingLayout";
import {
  OnboardingFormField,
  OnboardingSelectField,
} from "@/features/onboarding/components/OnboardingFormField";
import { AddressMapPicker } from "@/features/onboarding/components/AddressMapPicker";
import { catalogApi, type CatalogItem } from "@/lib/api/catalog.api";
import { employerApi, type RecruiterTitle } from "@/lib/api/employer.api";
import {
  employerIndustryLabel,
  employerIndustryPlaceholder,
} from "@/lib/catalog-labels";
import { getDefaultCoordinates, isAddressReadyForMap } from "@/lib/google-maps";
import { mediaUrl } from "@/lib/media";
import { useAuth } from "@/hooks/useAuth";

const RECRUITER_TITLES: { value: RecruiterTitle; label: string }[] = [
  { value: "OWNER", label: "Chủ cửa hàng / Chủ doanh nghiệp" },
  { value: "MANAGER", label: "Quản lý" },
  { value: "HR", label: "Nhân sự (HR)" },
  { value: "OTHER", label: "Khác" },
];

function SetupSection({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wide text-on-surface">
        <LucideIcon name={icon} size={16} strokeWidth={2.4} />
        <span>{title}</span>
      </div>
      {children}
    </section>
  );
}

export function EmployerSetupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const isEditMode = location.pathname.startsWith("/profile/");
  const { user, refreshMe } = useAuth();

  const [industries, setIndustries] = useState<CatalogItem[]>([]);
  const [provinces, setProvinces] = useState<CatalogItem[]>([]);
  const [districts, setDistricts] = useState<CatalogItem[]>([]);
  const [wards, setWards] = useState<CatalogItem[]>([]);

  const [businessName, setBusinessName] = useState("");
  const [organizationType, setOrganizationType] = useState("");
  const [taxCode, setTaxCode] = useState("");
  const [recruiterName, setRecruiterName] = useState(user?.fullName ?? "");
  const [recruiterTitle, setRecruiterTitle] = useState<RecruiterTitle | "">("");
  const [recruiterTitleOther, setRecruiterTitleOther] = useState("");
  const [address, setAddress] = useState("");
  const [provinceId, setProvinceId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [wardId, setWardId] = useState("");
  const [coordinates, setCoordinates] = useState(getDefaultCoordinates());
  const [contactPhone, setContactPhone] = useState(user?.phone ?? "");
  const [contactEmail, setContactEmail] = useState(user?.email ?? "");
  const [emailVerified, setEmailVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    catalogApi.getIndustries().then(setIndustries);
    catalogApi.getProvinces().then(setProvinces);
    employerApi
      .getProfile()
      .then(async (profile) => {
        if (profile.businessName) setBusinessName(profile.businessName);
        if (profile.organizationType) setOrganizationType(profile.organizationType);
        if (profile.taxCode) setTaxCode(profile.taxCode);
        if (profile.recruiterName) setRecruiterName(profile.recruiterName);
        if (profile.recruiterTitle) setRecruiterTitle(profile.recruiterTitle);
        if (profile.recruiterTitleOther) {
          setRecruiterTitleOther(profile.recruiterTitleOther);
        }
        if (profile.address) setAddress(profile.address);
        if (profile.provinceId) setProvinceId(profile.provinceId);
        if (profile.districtId) setDistrictId(profile.districtId);
        if (profile.wardId) setWardId(profile.wardId);
        if (profile.coordinates) setCoordinates(profile.coordinates);
        if (profile.contactPhone) setContactPhone(profile.contactPhone);
        if (profile.contactEmail) setContactEmail(profile.contactEmail);
        setEmailVerified(profile.contactEmailVerified);
        if (profile.logo) setLogoPreview(mediaUrl(profile.logo));

        const email = profile.contactEmail ?? user?.email ?? "";
        if (
          email &&
          user?.email &&
          email.toLowerCase() === user.email.toLowerCase() &&
          !profile.contactEmailVerified
        ) {
          const result = await employerApi.sendEmailOtp(email);
          if (result.autoVerified) {
            setEmailVerified(true);
            setInfo(result.message);
          }
        }
      })
      .catch(() => {
        /* profile may not exist yet */
      });
  }, [user?.email]);

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

  const locationLabel = useMemo(() => {
    const province = provinces.find((p) => p.id === provinceId)?.name;
    const district = districts.find((d) => d.id === districtId)?.name;
    const ward = wards.find((w) => w.id === wardId)?.name;
    return [ward, district, province].filter(Boolean).join(", ");
  }, [provinces, districts, wards, provinceId, districtId, wardId]);

  const addressReadyForMap = isAddressReadyForMap(
    address,
    provinceId,
    districtId,
    wardId,
  );

  const buildPayload = () => ({
    businessName: businessName.trim(),
    organizationType,
    ...(taxCode.trim() ? { taxCode: taxCode.trim() } : {}),
    recruiterName: recruiterName.trim(),
    ...(recruiterTitle ? { recruiterTitle } : {}),
    ...(recruiterTitle === "OTHER" && recruiterTitleOther.trim()
      ? { recruiterTitleOther: recruiterTitleOther.trim() }
      : {}),
    address: address.trim(),
    provinceId,
    districtId,
    wardId,
    coordinates,
    contactPhone: contactPhone.trim(),
    contactEmail: contactEmail.trim(),
  });

  const validateForm = () => {
    if (
      !businessName.trim() ||
      !organizationType ||
      !recruiterName.trim() ||
      !address.trim() ||
      !provinceId ||
      !districtId ||
      !wardId ||
      !contactPhone.trim() ||
      !contactEmail.trim()
    ) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc");
      return false;
    }
    if (!emailVerified) {
      setError("Vui lòng xác thực email liên hệ trước khi hoàn tất");
      return false;
    }
    return true;
  };

  const handleSendOtp = async () => {
    if (!contactEmail.trim()) {
      setError("Vui lòng nhập email liên hệ");
      return;
    }

    setOtpLoading(true);
    setError(null);
    setInfo(null);
    try {
      const result = await employerApi.sendEmailOtp(contactEmail.trim());
      if (result.autoVerified) {
        setEmailVerified(true);
        setInfo(result.message);
        if (result.profile) {
          setEmailVerified(result.profile.contactEmailVerified);
        }
      } else {
        setOtpSent(true);
        setInfo("Đã gửi mã xác thực. Kiểm tra hộp thư của bạn.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không gửi được mã xác thực");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setError("Vui lòng nhập mã xác thực");
      return;
    }

    setOtpLoading(true);
    setError(null);
    try {
      const result = await employerApi.verifyEmailOtp(
        contactEmail.trim(),
        otp.trim(),
      );
      setEmailVerified(result.profile.contactEmailVerified);
      setInfo("Xác thực email thành công");
      setOtp("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Mã xác thực không đúng");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleFinish = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    try {
      if (logoFile) {
        const uploaded = await employerApi.uploadLogo(logoFile);
        setLogoPreview(mediaUrl(uploaded.logo));
      }

      await employerApi.updateProfile(buildPayload());
      await refreshMe();
      navigate(isEditMode ? "/profile/employer" : "/", { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lưu hồ sơ thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoSelect = (file: File) => {
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  return (
    <OnboardingLayout
      step={isEditMode ? undefined : 1}
      total={isEditMode ? undefined : 1}
      centered
      wide
      className="max-w-[800px] pb-40 pt-5"
      title={isEditMode ? "Chỉnh sửa thông tin doanh nghiệp" : "Thông tin doanh nghiệp"}
      subtitle="Hoàn thiện hồ sơ để bắt đầu kết nối với những ứng viên tiềm năng nhất."
    >
      <div className="mx-auto w-full max-w-[640px] space-y-7 pb-36">
        <div className="flex flex-col items-center">
          <button
            type="button"
            aria-label="Tải logo hoặc ảnh đại diện"
            onClick={() => logoInputRef.current?.click()}
            className="group relative"
          >
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-border-subtle bg-surface-container-low transition group-hover:scale-95">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt=""
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <LucideIcon name="add_a_photo" size={30} className="text-on-surface-variant" />
              )}
            </div>
            <span className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-primary text-on-primary shadow-sm">
              <LucideIcon name="edit" size={16} />
            </span>
          </button>
          <span className="mt-3 text-xs font-medium text-on-surface-variant">
            Tải lên logo hoặc ảnh đại diện
          </span>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleLogoSelect(file);
            }}
          />
        </div>

        <SetupSection icon="apartment" title="Thông tin doanh nghiệp">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <OnboardingFormField
                label="Tên doanh nghiệp/quán/công ty"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Ví dụ: Công ty TNHH Giải pháp Công nghệ"
              />
            </div>
            <OnboardingSelectField
              label={employerIndustryLabel}
              value={organizationType}
              onChange={(e) => setOrganizationType(e.target.value)}
            >
              <option value="">{employerIndustryPlaceholder}</option>
              {industries.map((industry) => (
                <option key={industry.id} value={industry.id}>
                  {industry.name}
                </option>
              ))}
            </OnboardingSelectField>
            <OnboardingFormField
              label="Mã số thuế"
              value={taxCode}
              onChange={(e) => setTaxCode(e.target.value)}
              placeholder="10 chữ số"
              inputMode="numeric"
            />
          </div>
        </SetupSection>

        <SetupSection icon="work" title="Người liên hệ">
          <div className="grid gap-4 sm:grid-cols-2">
            <OnboardingFormField
              label="Tên người tuyển dụng"
              value={recruiterName}
              onChange={(e) => setRecruiterName(e.target.value)}
              placeholder="Họ và tên"
            />
            <OnboardingSelectField
              label="Chức vụ"
              value={recruiterTitle}
              onChange={(e) => setRecruiterTitle(e.target.value as RecruiterTitle | "")}
            >
              <option value="">Chọn chức vụ của bạn</option>
              {RECRUITER_TITLES.map((title) => (
                <option key={title.value} value={title.value}>
                  {title.label}
                </option>
              ))}
            </OnboardingSelectField>
            {recruiterTitle === "OTHER" ? (
              <OnboardingFormField
                label="Chức vụ khác"
                value={recruiterTitleOther}
                onChange={(e) => setRecruiterTitleOther(e.target.value)}
                placeholder="Ví dụ: Trưởng chi nhánh"
              />
            ) : null}
            <OnboardingFormField
              label="Số điện thoại"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="09x xxx xxxx"
            />
            <div className="space-y-2">
              <OnboardingFormField
                label="Email công việc"
                type="email"
                value={contactEmail}
                onChange={(e) => {
                  setContactEmail(e.target.value);
                  setEmailVerified(false);
                  setOtpSent(false);
                }}
                placeholder="email@company.com"
              />
              {emailVerified ? (
                <p className="text-xs font-semibold text-green-700">Email đã xác thực</p>
              ) : (
                <button
                  type="button"
                  className="text-xs font-semibold text-primary underline-offset-2 hover:underline disabled:opacity-50"
                  onClick={handleSendOtp}
                  disabled={otpLoading || !contactEmail.trim()}
                >
                  {otpLoading ? "Đang gửi..." : "Gửi mã xác thực"}
                </button>
              )}
            </div>
            {otpSent && !emailVerified ? (
              <div className="flex gap-2 sm:col-span-2">
                <input
                  className="onboarding-input flex-1"
                  placeholder="Nhập mã 6 số"
                  value={otp}
                  maxLength={6}
                  inputMode="numeric"
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                />
                <Button
                  type="button"
                  className="min-w-32 bg-primary text-on-primary hover:bg-primary/90"
                  onClick={handleVerifyOtp}
                  loading={otpLoading}
                  disabled={otp.length !== 6}
                >
                  Xác thực
                </Button>
              </div>
            ) : null}
          </div>
        </SetupSection>

        <SetupSection icon="apartment" title="Địa chỉ trụ sở">
          <div className="grid gap-4 sm:grid-cols-3">
            <OnboardingSelectField
              label="Tỉnh/Thành phố"
              value={provinceId}
              onChange={(e) => {
                setProvinceId(e.target.value);
                setDistrictId("");
                setWardId("");
              }}
            >
              <option value="">Chọn</option>
              {provinces.map((province) => (
                <option key={province.id} value={province.id}>
                  {province.name}
                </option>
              ))}
            </OnboardingSelectField>
            <OnboardingSelectField
              label="Quận/Huyện"
              value={districtId}
              disabled={!provinceId}
              onChange={(e) => {
                setDistrictId(e.target.value);
                setWardId("");
              }}
            >
              <option value="">Chọn</option>
              {districts.map((district) => (
                <option key={district.id} value={district.id}>
                  {district.name}
                </option>
              ))}
            </OnboardingSelectField>
            <OnboardingSelectField
              label="Phường/Xã"
              value={wardId}
              disabled={!districtId}
              onChange={(e) => setWardId(e.target.value)}
            >
              <option value="">Chọn</option>
              {wards.map((ward) => (
                <option key={ward.id} value={ward.id}>
                  {ward.name}
                </option>
              ))}
            </OnboardingSelectField>
            <div className="sm:col-span-3">
              <OnboardingFormField
                label="Địa chỉ chi tiết"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Số nhà, tên đường..."
              />
            </div>
            <div className="sm:col-span-3">
              <AddressMapPicker
                address={address}
                locationLabel={locationLabel}
                isReady={addressReadyForMap}
                coordinates={coordinates}
                onCoordinatesChange={setCoordinates}
                compact
              />
            </div>
          </div>
        </SetupSection>

        {info ? <p className="text-sm text-green-700">{info}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border-subtle bg-background/95 px-5 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-[640px] gap-3">
          <Button
            type="button"
            variant="ghost"
            className="flex-1"
            onClick={() => navigate(isEditMode ? "/profile/employer" : "/onboarding")}
          >
            Quay lại
          </Button>
          <Button
            type="button"
            className="flex-[2] bg-primary text-on-primary hover:bg-primary/90"
            onClick={handleFinish}
            loading={loading}
            disabled={!emailVerified}
          >
            {isEditMode ? "Lưu thay đổi" : "Hoàn tất thiết lập"}
          </Button>
        </div>
      </div>
    </OnboardingLayout>
  );
}
