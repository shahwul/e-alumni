import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

export default function QuerySelector({
  value,
  onChange,
  options,
  label,
  className = ""
}) {
  return (
    <div className="flex flex-col gap-1">
      <Select value={value ?? ""} onValueChange={onChange}>
        <SelectTrigger className={className}>
          <SelectValue placeholder={label || "Select option"} />
        </SelectTrigger>

        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
