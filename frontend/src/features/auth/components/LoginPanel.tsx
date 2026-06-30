import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleSignInButton } from "@/features/auth/components/GoogleSignInButton";
import { useAuth } from "@/hooks/useAuth";
import { needsOnboarding, onboardingHomePath } from "@/lib/onboarding";

export function LoginPanel() {
  const navigate = useNavigate();
  const { loginWithGoogle } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const hasGoogle = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

  const handleGoogleSuccess = async (idToken: string) => {
    setError(null);
    try {
      const user = await loginWithGoogle(idToken);
      if (needsOnboarding(user)) {
        navigate(onboardingHomePath(user), { replace: true });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Đăng nhập thất bại");
      throw e;
    }
  };

  return (
    <div className="rounded-2xl text-center border border-neutral-200 bg-[#F5F5F5] p-6">
      <h2 className="text-xl font-bold text-neutral-900 leading-snug">
        Đăng nhập hoặc đăng ký WorkShift
      </h2>
      <p className="mt-2 text-[15px] text-neutral-600 leading-relaxed">
        Xem ca làm quanh bạn và ứng tuyển — tham gia bằng tài khoản Google.
      </p>

      <div className="mt-6">
        {hasGoogle ? (
          <GoogleSignInButton onSuccess={handleGoogleSuccess} width={280} />
        ) : (
          <p className="text-sm text-amber-700">
            Thiếu cấu hình Google. Thêm{" "}
            <code className="text-xs">VITE_GOOGLE_CLIENT_ID</code> vào file .env.
          </p>
        )}
      </div>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      <p className="mt-6 text-[11px] text-neutral-500 leading-relaxed">
        Bằng việc tiếp tục, bạn đồng ý với Điều khoản và Chính sách quyền riêng tư của
        WorkShift.
      </p>
    </div>
  );
}
