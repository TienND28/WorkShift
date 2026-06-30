import type { AuthUser } from "@/types/auth.types";

export function needsOnboarding(user: AuthUser | null): boolean {
  return Boolean(user?.onboarding?.needsOnboarding);
}

export function onboardingHomePath(user: AuthUser): string {
  const { stage, profileType } = user.onboarding;

  if (stage === "role") return "/onboarding";
  if (stage === "worker_setup" || profileType === "WORKER") {
    return "/onboarding/worker/personal";
  }
  if (stage === "employer_setup" || profileType === "EMPLOYER") {
    return "/onboarding/employer/setup";
  }
  return "/";
}
