import type { ReactNode } from "react";
import { OnboardingSetupHeader } from "@/features/onboarding/components/OnboardingSetupHeader";

interface RoleSelectLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function RoleSelectLayout({ title, subtitle, children }: RoleSelectLayoutProps) {
  return (
    <div className="onboarding-shell">
      <OnboardingSetupHeader />

      <main className="onboarding-main flex flex-1 flex-col justify-center gap-(--spacing-section-gap) py-10">
        <header className="space-y-(--spacing-base) text-center">
          <h1 className="onboarding-title">{title}</h1>
          <p className="onboarding-subtitle">{subtitle}</p>
        </header>
        {children}
      </main>
    </div>
  );
}
