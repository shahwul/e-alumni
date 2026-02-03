import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";

export function PTKTable({ data, loading }) {
  return (
    <div className="relative max-h-[60vh] w-full overflow-auto">
      {loading ? (
        // Skeleton Loader Sederhana
        <div className="p-8 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-12 bg-slate-50 animate-pulse rounded-md w-full"
            />
          ))}
        </div>
      ) : (
        <DataTable columns={columns} data={data} />
      )}
    </div>
  );
}
