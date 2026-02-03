import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calendar, Users, ChevronUp, ChevronDown } from "lucide-react";

export default function DiklatCardHeader({
  data,
  expanded,
  isEditing,
  setExpanded,
  formatDate,
}) {
  return (
    <div
      className="p-5 cursor-pointer"
      onClick={() => !isEditing && setExpanded(!expanded)}
    >
      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="secondary"
              className="text-[10px] font-normal bg-slate-100 text-slate-600 border border-slate-200"
            >
              {data.topic_name || "Umum"}
            </Badge>

            <Badge
              variant="outline"
              className={cn(
                "text-[10px] font-medium border",
                data.moda === "Daring"
                  ? "text-blue-600 bg-blue-50 border-blue-200"
                  : data.moda === "Luring"
                  ? "text-orange-600 bg-orange-50 border-orange-200"
                  : "text-purple-600 bg-purple-50 border-purple-200"
              )}
            >
              {data.moda}
            </Badge>
          </div>

          <h3 className="font-bold text-slate-900 text-lg leading-tight group-hover:text-blue-700 transition-colors">
            {data.title}
          </h3>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>
                {formatDate(data.start_date)} -{" "}
                {formatDate(data.end_date)}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <Users
                className={cn(
                  "w-4 h-4",
                  data.total_peserta > 0
                    ? "text-green-500"
                    : "text-slate-400"
                )}
              />
              <span
                className={
                  data.total_peserta > 0
                    ? "text-slate-700 font-medium"
                    : ""
                }
              >
                {data.total_peserta > 0
                  ? `${data.total_peserta} Peserta`
                  : "Belum ada peserta"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end pl-4 border-l border-slate-100">
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-blue-600 rounded-full h-8 w-8"
          >
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </Button>
        </div>
      </div>
    </div>
  );
}
