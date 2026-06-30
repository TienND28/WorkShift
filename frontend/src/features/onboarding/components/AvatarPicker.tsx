import { useRef } from "react";
import { LucideIcon } from "@/components/icons/LucideIcon";

interface AvatarPickerProps {
  previewUrl?: string | null;
  onSelect: (file: File) => void;
}

export function AvatarPicker({ previewUrl, onSelect }: AvatarPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="mb-(--spacing-section-gap) flex flex-col items-center">
      <button
        type="button"
        aria-label="Tải ảnh đại diện"
        onClick={() => inputRef.current?.click()}
        className="group relative"
      >
        <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border border-border-subtle bg-surface-container-low transition-transform duration-200 group-hover:scale-95 group-active:scale-90">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt=""
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <LucideIcon
              name="add_a_photo"
              size={40}
              className="text-on-surface-variant"
            />
          )}
        </div>
        <div className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full border-2 border-background bg-primary text-on-primary shadow-sm">
          <LucideIcon name="edit" size={20} />
        </div>
      </button>
      <span className="mt-4 text-sm font-semibold text-on-surface-variant">
        Tải ảnh đại diện
      </span>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onSelect(file);
        }}
      />
    </div>
  );
}
