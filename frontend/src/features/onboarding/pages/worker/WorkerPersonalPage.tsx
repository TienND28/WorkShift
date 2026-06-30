import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { WorkerOnboardingChrome } from "@/features/onboarding/components/WorkerOnboardingChrome";
import {
  OnboardingFormField,
  OnboardingGenderField,
} from "@/features/onboarding/components/OnboardingFormField";
import { AvatarPicker } from "@/features/onboarding/components/AvatarPicker";
import { useAuth } from "@/hooks/useAuth";
import { userApi } from "@/lib/api/user.api";
import { workerApi } from "@/lib/api/worker.api";
import { authStore } from "@/stores/authStore";
import { mediaUrl } from "@/lib/media";

export function WorkerPersonalPage() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth ?? "");
  const [gender, setGender] = useState(user?.gender ?? "MALE");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    mediaUrl(user?.avatarUrl),
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    workerApi.createProfile().catch(() => {
      /* already exists */
    });
  }, []);

  useEffect(() => {
    if (!avatarFile && user?.avatarUrl) {
      setAvatarPreview(mediaUrl(user.avatarUrl));
    }
  }, [user?.avatarUrl, avatarFile]);

  const handleNext = async () => {
    if (!fullName.trim() || !dateOfBirth) {
      setError("Vui lòng nhập họ tên và ngày sinh");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let updated = await userApi.updateMe({
        fullName: fullName.trim(),
        dateOfBirth,
        gender,
        phone: phone.trim() || undefined,
      });
      if (avatarFile) {
        updated = await userApi.uploadAvatar(avatarFile);
      }
      setUser(updated);
      authStore.setUser(updated);
      navigate("/onboarding/worker/positions");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lưu thông tin thất bại");
    } finally {
      setLoading(false);
    }
  };

  const canContinue = Boolean(fullName.trim() && dateOfBirth);

  return (
    <WorkerOnboardingChrome
      step={1}
      total={4}
      title="Thông tin cá nhân"
      subtitle="Hãy cho chúng tôi biết một chút về bạn để hoàn thiện hồ sơ."
      onNext={handleNext}
      loading={loading}
      nextDisabled={!canContinue}
    >
      <AvatarPicker
        previewUrl={avatarPreview}
        onSelect={(file) => {
          setAvatarFile(file);
          setAvatarPreview(URL.createObjectURL(file));
        }}
      />

      <form
        className="flex flex-col gap-6"
        onSubmit={(e) => {
          e.preventDefault();
          void handleNext();
        }}
      >
        <OnboardingFormField
          label="Họ và tên"
          id="fullname"
          placeholder="Nhập họ và tên của bạn"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

        <OnboardingFormField
          label="Ngày tháng năm sinh"
          id="dob"
          type="date"
          value={dateOfBirth}
          max={new Date().toISOString().slice(0, 10)}
          onChange={(e) => setDateOfBirth(e.target.value)}
          required
        />

        <OnboardingGenderField
          label="Giới tính"
          value={gender}
          onChange={setGender}
          options={[
            { value: "MALE", label: "Nam" },
            { value: "FEMALE", label: "Nữ" },
          ]}
        />

        <OnboardingFormField
          label="Số điện thoại"
          id="phone"
          type="tel"
          placeholder="09x xxx xxxx"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <OnboardingFormField
          label="Email"
          id="email"
          type="email"
          value={user?.email ?? ""}
          readOnly
          className="cursor-not-allowed opacity-70"
        />

        {error ? <p className="text-sm text-error">{error}</p> : null}
      </form>
    </WorkerOnboardingChrome>
  );
}
