import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useState } from "react";

interface GoogleSignInButtonProps {
  onSuccess: (idToken: string) => Promise<void>;
  width?: number;
}

export function GoogleSignInButton({ onSuccess, width = 320 }: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSuccess = async (response: CredentialResponse) => {
    const idToken = response.credential;
    if (!idToken) {
      setError("Không nhận được token từ Google");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSuccess(idToken);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm flex flex-col items-center gap-4">
      {loading ? (
        <div className="flex items-center gap-2 text-neutral-600 text-sm">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-200 border-t-blue-600" />
          Đang đăng nhập...
        </div>
      ) : (
        <div className="google-btn-wrapper w-full flex justify-center">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => setError("Đăng nhập Google bị hủy hoặc lỗi")}
            theme="outline"
            size="large"
            shape="pill"
            text="continue_with"
            width={String(width)}
          />
        </div>
      )}
      {error ? (
        <p className="text-center text-sm text-red-600">{error}</p>
      ) : null}
    </div>
  );
}
