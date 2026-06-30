import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { needsOnboarding } from "@/lib/onboarding";

interface OnboardingRouteProps {
  children: ReactNode;
}

/** Chỉ cho phép truy cập khi user đang trong luồng thiết lập tài khoản */
export function OnboardingRoute({ children }: OnboardingRouteProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (user && !needsOnboarding(user)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
