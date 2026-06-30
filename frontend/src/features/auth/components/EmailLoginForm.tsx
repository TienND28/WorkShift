import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { authApi } from "@/lib/api/auth.api";

export function EmailLoginForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [devLink, setDevLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setDevLink(null);
    try {
      const res = await authApi.requestEmailLogin(email.trim());
      setSent(true);
      if (res.devMagicLink) {
        setDevLink(res.devMagicLink);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gửi email thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
        <p className="font-medium">Kiểm tra email của bạn</p>
        <p className="mt-1 text-green-700">
          Chúng tôi đã gửi liên kết đăng nhập đến <strong>{email}</strong>. Liên kết
          có hiệu lực 15 phút.
        </p>
        {devLink ? (
          <p className="mt-3 break-all text-xs">
            <span className="font-medium">[DEV]</span>{" "}
            <a href={devLink} className="text-blue-700 underline">
              {devLink}
            </a>
          </p>
        ) : null}
        <button
          type="button"
          className="mt-3 text-sm font-medium text-green-900 underline"
          onClick={() => {
            setSent(false);
            setEmail("");
          }}
        >
          Dùng email khác
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label className="block text-sm font-medium text-neutral-700">
        Email
        <input
          type="email"
          required
          autoComplete="email"
          placeholder="ten.ban@email.com"
          className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 text-base outline-none focus:border-blue-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <Button type="submit" fullWidth loading={loading}>
        Gửi liên kết đăng nhập
      </Button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
