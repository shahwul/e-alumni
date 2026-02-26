import { HEATMAP_COLORS } from "@/lib/constants";

export default function MapLegend({ show }) {
  if (!show) return null;

  return (
    <div className="absolute bottom-6 left-6 z-[400] bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-md border border-slate-200 pointer-events-none">
      <h4 className="font-semibold text-sm text-slate-700 mb-3">
        Skala Persebaran Alumni
      </h4>

      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-[11px] text-slate-500 font-medium px-0.5">
          <span>Rendah</span>
          <span>Tinggi</span>
        </div>

        <div className="flex">
          <span className="w-6 h-3.5 border border-slate-200 bg-[#e2e8f0]"></span>
          {[...HEATMAP_COLORS].reverse().map((item, index) => (
            <span
              key={index}
              className="w-6 h-3.5 border-y border-r first:border-l border-black/5"
              style={{ backgroundColor: item.color }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
