import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RoleSelectLayout } from "@/features/onboarding/components/RoleSelectLayout";
import { LucideIcon } from "@/components/icons/LucideIcon";
import { useAuth } from "@/hooks/useAuth";
import type { ProfileType } from "@/types/auth.types";

const roles: {
  type: ProfileType;
  title: string;
  description: string;
  icon: string;
}[] = [
  {
    type: "WORKER",
    title: "Người lao động",
    description: "Tìm kiếm công việc casual linh hoạt.",
    icon: "work",
  },
  {
    type: "EMPLOYER",
    title: "Nhà tuyển dụng",
    description: "Đăng bài và tìm kiếm nhân sự nhanh chóng.",
    icon: "apartment",
  },
];

export function RoleSelectPage() {
  const navigate = useNavigate();
  const { selectProfileType } = useAuth();
  const [selected, setSelected] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = async () => {
    if (!selected) return;
    setLoading(true);
    setError(null);
    try {
      const user = await selectProfileType(selected);
      if (selected === "WORKER") {
        navigate("/onboarding/worker/personal", { replace: true });
      } else {
        navigate("/onboarding/employer/setup", { replace: true });
      }
      void user;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể lưu lựa chọn");
    } finally {
      setLoading(false);
    }
  };

  return (
    <RoleSelectLayout
      title="Bạn muốn tham gia với vai trò nào?"
      subtitle="Chọn một vai trò để bắt đầu trải nghiệm WorkShift."
    >
      <div className="grid grid-cols-1 gap-(--spacing-gutter) md:grid-cols-2">
        {roles.map((role) => {
          const active = selected === role.type;
          return (
            <button
              key={role.type}
              type="button"
              aria-selected={active}
              onClick={() => setSelected(role.type)}
              className={`role-card group flex flex-col items-center rounded-2xl border border-border-subtle bg-surface-container-lowest p-(--spacing-container-padding) text-center transition-all duration-200 hover:bg-surface-container-low active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                active ? "selected" : ""
              }`}
            >
              <div className="mb-(--spacing-gutter) flex h-16 w-16 items-center justify-center rounded-full bg-surface-container transition-colors group-hover:bg-surface-variant">
                <LucideIcon name={role.icon} size={32} filled={active} />
              </div>
              <h2 className="mb-(--spacing-base) text-2xl font-semibold text-primary">
                {role.title}
              </h2>
              <p className="text-base text-on-surface-variant">{role.description}</p>
            </button>
          );
        })}
      </div>

      {error ? <p className="text-center text-sm text-error">{error}</p> : null}

      <div className="mt-(--spacing-gutter) flex justify-center">
        <button
          type="button"
          className="onboarding-btn-primary w-full min-w-[200px] md:w-auto"
          disabled={!selected || loading}
          onClick={handleContinue}
        >
          {loading ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            "Tiếp tục"
          )}
        </button>
      </div>
    </RoleSelectLayout>
  );
}
