import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";

interface ModalProps {
  open: boolean;
  title: ReactNode;
  children: ReactNode;
  onClose: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
  loading?: boolean;
  danger?: boolean;
  className?: string;
}

export function Modal({
  open,
  title,
  className = "",
  children,
  onClose,
  onSubmit,
  submitLabel = "Lưu",
  loading,
  danger,
}: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-neutral-900/40 "
        aria-label="Đóng"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative z-10 w-full max-w-md rounded-2xl bg-white p-15 shadow-xl ${className}`}
      >
        <h2 className="text-lg font-bold text-neutral-900">{title}</h2>
        <div className="mt-4 space-y-4">{children}</div>
        <div className="mt-6 flex justify-end gap-2">
          {onSubmit ? (
            <Button
              onClick={onSubmit}
              loading={loading}
              className={
                danger
                  ? "!bg-red-600 hover:!bg-red-700"
                  : "!bg-teal-600 hover:!bg-teal-700 !rounded-xl"
              }
            >
              {submitLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
