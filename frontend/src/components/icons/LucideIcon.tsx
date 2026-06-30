import {
  ArrowLeft,
  Briefcase,
  Building2,
  Camera,
  Check,
  ChevronDown,
  Clock,
  Pencil,
  Plus,
  X,
  type LucideIcon as LucideIconComponent,
} from "lucide-react";

const ICON_MAP = {
  arrow_back: ArrowLeft,
  apartment: Building2,
  work: Briefcase,
  add: Plus,
  add_a_photo: Camera,
  check: Check,
  close: X,
  edit: Pencil,
  expand_more: ChevronDown,
  schedule: Clock,
} satisfies Record<string, LucideIconComponent>;

export type LucideIconName = keyof typeof ICON_MAP;

interface LucideIconProps {
  name: string;
  className?: string;
  size?: number;
  filled?: boolean;
  strokeWidth?: number;
}

export function LucideIcon({
  name,
  className = "",
  size = 20,
  filled,
  strokeWidth,
}: LucideIconProps) {
  const Icon = ICON_MAP[name as LucideIconName];
  if (!Icon) return null;

  return (
    <Icon
      aria-hidden
      className={className}
      size={size}
      strokeWidth={strokeWidth ?? (filled ? 2.5 : 2)}
      fill={filled ? "currentColor" : "none"}
    />
  );
}
