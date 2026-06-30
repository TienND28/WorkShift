import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { LucideIcon } from "@/components/icons/LucideIcon";

interface OnboardingFormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function OnboardingFormField({ label, id, className = "", ...props }: OnboardingFormFieldProps) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-2">
      <label className="onboarding-label" htmlFor={fieldId}>
        {label}
      </label>
      <input id={fieldId} className={`onboarding-input ${className}`} {...props} />
    </div>
  );
}

interface OnboardingSelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  children: ReactNode;
}

export function OnboardingSelectField({
  label,
  id,
  children,
  className = "",
  ...props
}: OnboardingSelectFieldProps) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-2">
      <label className="onboarding-label text-primary" htmlFor={fieldId}>
        {label}
      </label>
      <div className="group relative">
        <select id={fieldId} className={`onboarding-select ${className}`} {...props}>
          {children}
        </select>
        <LucideIcon
          name="expand_more"
          size={20}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-outline transition-colors group-focus-within:text-primary"
        />
      </div>
    </div>
  );
}

interface GenderOption {
  value: string;
  label: string;
}

interface OnboardingGenderFieldProps {
  label: string;
  value: string;
  options: GenderOption[];
  onChange: (value: string) => void;
}

export function OnboardingGenderField({
  label,
  value,
  options,
  onChange,
}: OnboardingGenderFieldProps) {
  return (
    <div className="flex flex-col gap-3">
      <span className="onboarding-label">{label}</span>
      <div className="flex gap-4">
        {options.map((opt) => {
          const checked = value === opt.value;
          return (
            <label
              key={opt.value}
              className={`flex h-14 flex-1 cursor-pointer items-center justify-center rounded-xl border bg-[#f5f5f5] px-4 transition hover:bg-surface-container-high ${
                checked
                  ? "border-primary bg-background-light"
                  : "border-transparent"
              }`}
            >
              <input
                type="radio"
                name="gender"
                value={opt.value}
                checked={checked}
                className="sr-only"
                onChange={() => onChange(opt.value)}
              />
              <span className="text-base text-primary">{opt.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
