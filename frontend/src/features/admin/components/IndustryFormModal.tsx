import { useEffect, useState } from "react";
import { Modal } from "@/components/admin/Modal";
import { Input } from "@/components/ui/Input";
import type { Industry } from "@/lib/api/industry.api";
import { adminIndustryLabel } from "@/lib/catalog-labels";

interface IndustryFormModalProps {
  open: boolean;
  editing: Industry | null;
  onClose: () => void;
  onSave: (data: { code: string; name: string; isActive?: boolean }) => Promise<void>;
}

export function IndustryFormModal({
  open,
  editing,
  onClose,
  onSave,
}: IndustryFormModalProps) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editing) {
      setCode(editing.code);
      setName(editing.name);
      setIsActive(editing.isActive);
    } else {
      setCode("");
      setName("");
      setIsActive(true);
    }
    setError(null);
  }, [editing, open]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError(`Vui lòng nhập tên ${adminIndustryLabel.toLowerCase()}`);
      return;
    }
    if (!editing && !code.trim()) {
      setError("Vui lòng nhập mã loại hình");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (editing) {
        await onSave({ code: editing.code, name: name.trim(), isActive });
      } else {
        await onSave({ code: code.trim().toLowerCase(), name: name.trim() });
      }
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lưu thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      title={editing ? `Chỉnh sửa ${adminIndustryLabel.toLowerCase()}` : "Thêm loại hình mới"}
      onClose={onClose}
      onSubmit={handleSubmit}
      loading={loading}
    >
      {!editing ? (
        <Input
          label="Mã loại hình"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="vd: fnb"
        />
      ) : (
        <p className="text-sm text-neutral-500">
          Mã: <span className="font-mono font-semibold text-neutral-800">{editing.code}</span>
        </p>
      )}
      <Input
        label={`Tên ${adminIndustryLabel.toLowerCase()}`}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="vd: Nhà hàng & Ăn uống"
      />
      {editing ? (
        <label className="flex items-center gap-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="rounded border-neutral-300 text-teal-600 focus:ring-teal-500"
          />
          Đang hiển thị (active)
        </label>
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </Modal>
  );
}
