import { useEffect, useState } from "react";
import { Modal } from "@/components/admin/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { Industry } from "@/lib/api/industry.api";
import type { Position } from "@/lib/api/position.api";
import { adminIndustryLabel } from "@/lib/catalog-labels";

interface PositionFormModalProps {
  open: boolean;
  editing: Position | null;
  industries: Industry[];
  onClose: () => void;
  onSave: (data: {
    code: string;
    name: string;
    industryId: string;
    isActive?: boolean;
  }) => Promise<void>;
}

export function PositionFormModal({
  open,
  editing,
  industries,
  onClose,
  onSave,
}: PositionFormModalProps) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [industryId, setIndustryId] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editing) {
      setCode(editing.code);
      setName(editing.name);
      setIndustryId(editing.industry?.id ?? "");
      setIsActive(editing.isActive);
    } else {
      setCode("");
      setName("");
      setIndustryId(industries.find((i) => i.isActive)?.id ?? "");
      setIsActive(true);
    }
    setError(null);
  }, [editing, open, industries]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Vui lòng nhập tên vị trí");
      return;
    }
    if (!editing && !code.trim()) {
      setError("Vui lòng nhập mã vị trí");
      return;
    }
    if (!industryId) {
      setError(`Vui lòng chọn ${adminIndustryLabel.toLowerCase()}`);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (editing) {
        await onSave({
          code: editing.code,
          name: name.trim(),
          industryId,
          isActive,
        });
      } else {
        await onSave({
          code: code.trim().toLowerCase(),
          name: name.trim(),
          industryId,
        });
      }
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lưu thất bại");
    } finally {
      setLoading(false);
    }
  };

  const activeIndustries = industries.filter((i) => i.isActive);

  return (
    <Modal
      open={open}
      title={editing ? "Chỉnh sửa vị trí" : "Thêm vị trí mới"}
      onClose={onClose}
      onSubmit={handleSubmit}
      loading={loading}
    >
      {!editing ? (
        <Input
          label="Mã vị trí"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="vd: waiter"
        />
      ) : (
        <p className="text-sm text-neutral-500">
          Mã: <span className="font-mono font-semibold text-neutral-800">{editing.code}</span>
        </p>
      )}
      <Input
        label="Tên vị trí"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="vd: Phục vụ"
      />
      <Select
        label={adminIndustryLabel}
        value={industryId}
        onChange={(e) => setIndustryId(e.target.value)}
      >
        <option value="">— Chọn loại hình —</option>
        {activeIndustries.map((i) => (
          <option key={i.id} value={i.id}>
            {i.name}
          </option>
        ))}
      </Select>
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
