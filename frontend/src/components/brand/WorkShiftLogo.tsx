interface WorkShiftLogoProps {
  className?: string;
  size?: "sm" | "md";
  showText?: boolean;
}

export function WorkShiftLogo({
  className = "",
  size = "md",
  showText = true,
}: WorkShiftLogoProps) {
  const sizeClass =
    size === "sm"
      ? "h-8 w-8 text-lg rounded-lg"
      : "h-10 w-10 text-xl rounded-xl";

  const textClass = size === "sm" ? "text-lg" : "text-xl";

  return (
    <div
      className={`inline-flex items-center gap-2 ${className}`}
      aria-label="WorkShift"
    >
      <span
        className={`inline-flex items-center justify-center bg-[#008A3D] font-black text-white shadow-sm ${sizeClass}`}
      >
        W
      </span>

      {showText && (
        <span className={`font-extrabold text-[#008A3D] ${textClass}`}>
          WorkShift
        </span>
      )}
    </div>
  );
}
