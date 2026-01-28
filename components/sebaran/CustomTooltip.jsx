"use client";

export const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0];
    const total = payload[0].payload.totalCount || 0;
    const percent =
      total > 0 ? ((dataPoint.value / total) * 100).toFixed(1) : 0;

    return (
      <div className="bg-white p-3 border border-slate-200 shadow-md rounded text-xs">
        <p className="font-bold mb-1">{dataPoint.name}</p>
        <p className="text-slate-600">
          Jumlah:{" "}
          <span className="font-semibold text-blue-600">
            {new Intl.NumberFormat("id-ID").format(dataPoint.value)}
          </span>
        </p>
        {total > 0 && (
          <p className="text-slate-500">
            Persentase:{" "}
            <span className="font-semibold text-green-600">{percent}%</span>
          </p>
        )}
      </div>
    );
  }
  return null;
};
