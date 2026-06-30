import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { CatalogTable } from "@/features/admin/components/CatalogTable";
import { IndustryFormModal } from "@/features/admin/components/IndustryFormModal";
import { industryApi, type Industry } from "@/lib/api/industry.api";
import { adminIndustryLabel } from "@/lib/catalog-labels";

export function IndustriesPage() {
  const [rows, setRows] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Industry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Industry | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    industryApi
      .listAll()
      .then(setRows)
      .catch(() => setError(`Không tải được danh sách ${adminIndustryLabel.toLowerCase()}`))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (row: Industry) => {
    setEditing(row);
    setModalOpen(true);
  };

  const handleSave = async (data: {
    code: string;
    name: string;
    isActive?: boolean;
  }) => {
    if (editing) {
      await industryApi.update(editing.id, {
        name: data.name,
        isActive: data.isActive,
      });
    } else {
      await industryApi.create({ code: data.code, name: data.name });
    }
    load();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await industryApi.remove(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xóa thất bại");
    }
  };

  return (
    <AdminLayout
      title={adminIndustryLabel}
      subtitle={`Thêm, sửa hoặc ẩn ${adminIndustryLabel.toLowerCase()} trong danh mục hệ thống`}
      action={
        <Button
          onClick={openCreate}
          className="!rounded-xl !bg-teal-600 hover:!bg-teal-700 !px-5 !py-2.5 !text-sm"
        >
          + Thêm loại hình
        </Button>
      }
    >
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
      {loading ? (
        <div className="flex justify-center py-16">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-teal-600" />
        </div>
      ) : (
        <CatalogTable
          rows={rows}
          emptyMessage={`Chưa có ${adminIndustryLabel.toLowerCase()} nào`}
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
              header: "Tên loại hình",
              render: (r) => <span className="font-medium text-neutral-900">{r.name}</span>,
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

      <IndustryFormModal
        open={modalOpen}
        editing={editing}
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
            <h3 className="font-bold text-neutral-900">Xóa {adminIndustryLabel.toLowerCase()}?</h3>
            <p className="mt-2 text-sm text-neutral-600">
              <strong>{deleteTarget.name}</strong> sẽ bị ẩn khỏi hệ thống (soft delete).
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
                Hủy
              </Button>
              <Button
                className="!bg-red-600 hover:!bg-red-700 !rounded-xl"
                onClick={confirmDelete}
              >
                Xóa
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminLayout>
  );
}
