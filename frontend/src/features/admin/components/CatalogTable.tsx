import type { ReactNode } from "react";

interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

interface CatalogTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  emptyMessage?: string;
}

export function CatalogTable<T extends { id: string }>({
  columns,
  rows,
  emptyMessage = "Chưa có dữ liệu",
}: CatalogTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-100">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400 ${col.className ?? ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50/50"
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-5 py-4 ${col.className ?? ""}`}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 ? (
        <p className="py-12 text-center text-neutral-500">{emptyMessage}</p>
      ) : null}
    </div>
  );
}
