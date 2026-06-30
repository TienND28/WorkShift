import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { useAuthPrompt } from "@/features/auth/context/AuthPromptContext";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { hydrate, isAuthenticated } = useAuth();
  const { openAuthPrompt } = useAuthPrompt();
  const navigate = useNavigate();
  const location = useLocation();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    hydrate().finally(() => setReady(true));
  }, [hydrate]);

  useEffect(() => {
    if (!ready || isAuthenticated) return;
    const redirectPath = `${location.pathname}${location.search}${location.hash}`;
    openAuthPrompt({
      message: "Bạn cần đăng nhập Google để truy cập trang này.",
      redirectTo: redirectPath,
      onClose: () => navigate("/", { replace: true }),
    });
  }, [
    ready,
    isAuthenticated,
    location.pathname,
    location.search,
    location.hash,
    navigate,
    openAuthPrompt,
  ]);

  if (!ready) {
    return (
      <div className="min-h-dvh bg-white flex items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return children;
}
