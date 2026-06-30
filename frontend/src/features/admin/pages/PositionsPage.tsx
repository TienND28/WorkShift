import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { CatalogTable } from "@/features/admin/components/CatalogTable";
import { PositionFormModal } from "@/features/admin/components/PositionFormModal";
import { industryApi, type Industry } from "@/lib/api/industry.api";
import { positionApi, type Position } from "@/lib/api/position.api";
import { adminIndustryLabel } from "@/lib/catalog-labels";

export function PositionsPage() {
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [rows, setRows] = useState<Position[]>([]);
  const [filterIndustry, setFilterIndustry] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Position | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Position | null>(null);

  useEffect(() => {
    industryApi.listAll().then(setIndustries).catch(() => {});
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    positionApi
      .listAll(filterIndustry || undefined)
      .then(setRows)
      .catch(() => setError("Không tải được danh sách vị trí"))
      .finally(() => setLoading(false));
  }, [filterIndustry]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (row: Position) => {
    setEditing(row);
    setModalOpen(true);
  };

  const handleSave = async (data: {
    code: string;
    name: string;
    industryId: string;
    isActive?: boolean;
  }) => {
    if (editing) {
      await positionApi.update(editing.id, {
        name: data.name,
        industryId: data.industryId,
        isActive: data.isActive,
      });
    } else {
      await positionApi.create({
        code: data.code,
        name: data.name,
        industryId: data.industryId,
      });
    }
    load();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await positionApi.remove(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xóa thất bại");
    }
  };

  return (
    <AdminLayout
      title="Vị trí công việc"
      subtitle={`Quản lý vị trí theo từng ${adminIndustryLabel.toLowerCase()}`}
      action={
        <Button
          onClick={openCreate}
          className="!rounded-xl !bg-teal-600 hover:!bg-teal-700 !px-5 !py-2.5 !text-sm"
        >
          + Thêm vị trí
        </Button>
      }
    >
      <div className="mb-4 max-w-xs">
        <Select
          label={`Lọc theo ${adminIndustryLabel.toLowerCase()}`}
          value={filterIndustry}
          onChange={(e) => setFilterIndustry(e.target.value)}
        >
          <option value="">Tất cả loại hình</option>
          {industries.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name}
            </option>
          ))}
        </Select>
      </div>

      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
      {loading ? (
        <div className="flex justify-center py-16">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-teal-600" />
        </div>
      ) : (
        <CatalogTable
          rows={rows}
          emptyMessage="Chưa có vị trí nào"
          columns={[
            {
              key: "code",
              header: "Mã",
              render: (r) => (
                <span className="font-mono text-xs font-semibold text-neutral-700">{r.code}</span>
              ),
            },
            {
              key: "name",
              header: "Tên vị trí",
              render: (r) => <span className="font-medium text-neutral-900">{r.name}</span>,
            },
            {
              key: "industry",
              header: "Loại hình",
              render: (r) => (
                <span className="text-neutral-600">{r.industry?.name ?? "—"}</span>
              ),
            },
            {
              key: "status",
              header: "Trạng thái",
              render: (r) => (
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    r.isActive
                      ? "bg-teal-50 text-teal-700"
                      : "bg-neutral-100 text-neutral-500"
                  }`}
                >
                  {r.isActive ? "Active" : "Ẩn"}
                </span>
              ),
            },
            {
              key: "actions",
              header: "Thao tác",
              className: "text-right",
              render: (r) => (
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(r)}
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-50"
                  >
                    Sửa
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(r)}
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    Xóa
                  </button>
                </div>
              ),
            },
          ]}
        />
      )}

      <PositionFormModal
        open={modalOpen}
        editing={editing}
        industries={industries}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-neutral-900/40"
            aria-label="Đóng"
            onClick={() => setDeleteTarget(null)}
          />
          <div className="relative z-10 max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="font-bold text-neutral-900">Ẩn vị trí?</h3>
            <p className="mt-2 text-sm text-neutral-600">
              Vị trí <strong>{deleteTarget.name}</strong> sẽ được đánh dấu không active.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
                Hủy
              </Button>
              <Button
                className="!bg-red-600 hover:!bg-red-700 !rounded-xl"
                onClick={confirmDelete}
              >
                Xác nhận
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminLayout>
  );
}
