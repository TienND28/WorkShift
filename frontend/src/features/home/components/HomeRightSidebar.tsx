import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Headphones } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { GoogleSignInButton } from "@/features/auth/components/GoogleSignInButton";
import { needsOnboarding, onboardingHomePath } from "@/lib/onboarding";

const featuredCompanies = [
  { name: "Shopee Vietnam", jobs: "42 việc làm mới", logo: "S" },
  { name: "Coca-Cola Beverages", jobs: "15 việc làm mới", logo: "C" },
  { name: "Giao Hàng Nhanh", jobs: "89 việc làm mới", logo: "G" },
];

export function HomeRightSidebar() {
  const navigate = useNavigate();
  const { isAuthenticated, user, loginWithGoogle } = useAuth();
  const [loginError, setLoginError] = useState<string | null>(null);

  const isEmployer = Boolean(user?.profileTypes.includes("EMPLOYER"));
  const profilePath = isEmployer ? "/profile/employer" : "/profile";

  const handleGoogleSuccess = async (idToken: string) => {
    setLoginError(null);
    try {
      const u = await loginWithGoogle(idToken);
      if (needsOnboarding(u)) {
        navigate(onboardingHomePath(u), { replace: true });
      }
    } catch (e) {
      setLoginError(e instanceof Error ? e.message : "Đăng nhập thất bại");
    }
  };

  return (
    <aside className="space-y-4">
      <section className="rounded-lg border border-slate-300 bg-white p-5 shadow-sm">
        {isAuthenticated ? (
          <>
            <div className="flex items-center gap-3">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className="h-16 w-16 rounded-full object-cover ring-1 ring-slate-200"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#00B14F] text-xl font-bold text-white">
                  {user?.username?.[0]?.toUpperCase() ?? "?"}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-bold text-slate-950 truncate" title={user?.username}>
                  {user?.username}
                </h2>
                <p className="text-xs font-semibold text-slate-500">
                  {isEmployer ? "Nhà tuyển dụng" : "Người lao động"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate(profilePath)}
              className="mt-5 h-10 w-full rounded-md border border-[#009643] bg-white text-sm font-bold text-[#0A4B3E] transition hover:bg-[#E8F8EF]"
            >
              Xem chi tiết hồ sơ
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center text-center gap-3">
            <h2 className="text-sm font-bold text-slate-950">Đăng nhập WorkShift</h2>
            <p className="text-xs text-slate-500 leading-relaxed px-1">
              Đăng nhập bằng tài khoản Google để tìm kiếm và ứng tuyển các ca làm việc gần bạn ngay lập tức!
            </p>
            <div className="w-full flex justify-center py-1">
              <GoogleSignInButton onSuccess={handleGoogleSuccess} width={220} />
            </div>
            {loginError && (
              <p className="text-xs text-red-600 font-medium text-center">{loginError}</p>
            )}
          </div>
        )}
      </section>

      <section className="rounded-lg border border-slate-300 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-950">Doanh nghiệp nổi bật</h2>
          <button type="button" className="text-xs font-bold text-[#009643] hover:text-[#0A4B3E]">
            Tất cả
          </button>
        </div>

        <div className="space-y-2">
          {featuredCompanies.map((company) => (
            <button
              key={company.name}
              type="button"
              className="flex w-full items-center gap-3 rounded-md p-2 text-left transition hover:bg-slate-50"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#0A4B3E] text-sm font-bold text-white">
                {company.logo}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-slate-950">
                  {company.name}
                </span>
                <span className="block text-xs font-medium text-slate-500">{company.jobs}</span>
              </span>
              <ChevronRight className="h-4 w-4 text-[#0A4B3E]" />
            </button>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-lg bg-[#007A35] p-6 text-white shadow-sm">
        <h2 className="text-lg font-bold">Cần hỗ trợ?</h2>
        <p className="mt-2 text-sm font-medium leading-6 text-white/90">
          Chuyên viên tư vấn của chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7.
        </p>
        <button
          type="button"
          className="mt-5 rounded-md bg-white px-4 py-2 text-sm font-bold text-[#0A4B3E] transition hover:bg-slate-100"
        >
          Liên hệ ngay
        </button>
        <Headphones className="absolute -bottom-3 right-3 h-20 w-20 text-white/20" />
      </section>
    </aside>
  );
}
