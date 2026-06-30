import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { needsOnboarding, onboardingHomePath } from "@/lib/onboarding";

interface OnboardingGuardProps {
  children: ReactNode;
}

/** Chuyển user chưa hoàn tất onboarding ra khỏi feed */
export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const { user, isAuthenticated } = useAuth();

  if (isAuthenticated && user && needsOnboarding(user)) {
    return <Navigate to={onboardingHomePath(user)} replace />;
  }

  return children;
}
