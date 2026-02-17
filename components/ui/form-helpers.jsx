// components/ui/form-helpers.jsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar"; 
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export const FormInput = ({ control, name, label, placeholder, type = "text", disabled = false, isTextarea = false }) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem className="w-full">
        <FormLabel>{label}</FormLabel>
        <FormControl>
          {isTextarea ? (
            <Textarea placeholder={placeholder} {...field} className="resize-none bg-white" />
          ) : (
            <Input 
              type={type} 
              placeholder={placeholder} 
              disabled={disabled} 
              {...field} 
              value={field.value ?? ''}
              className={disabled ? "bg-slate-100 text-slate-500" : "bg-white"} 
            />
          )}
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

export const FormSelect = ({ control, name, label, placeholder, options, valueKey = "id", labelKey = "label", onChangeCustom }) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem className="w-full">
        <FormLabel>{label}</FormLabel>
        <Select 
          onValueChange={(val) => {
            field.onChange(val);
            if (onChangeCustom) onChangeCustom(val);
          }} 
          value={field.value ? field.value.toString() : ""} 
        >
          <FormControl>
            <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {options?.map((item) => (
              <SelectItem key={item[valueKey]} value={item[valueKey].toString()}>
                {item[labelKey]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    )}
  />
);

export const FormDatePicker = ({ control, name, label, minDate }) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem className="flex flex-col w-full">
        <FormLabel>{label}</FormLabel>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn("w-full justify-start text-left font-normal bg-white", !field.value && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {field.value ? format(new Date(field.value), "dd MMM yyyy", { locale: id }) : <span>Pilih Tanggal</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              captionLayout="dropdown"
              fromYear={2025} toYear={2035}
              selected={field.value ? new Date(field.value) : undefined}
              onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
              disabled={(date) => minDate ? date < new Date(minDate) : false}
              initialFocus
              locale={id}
            />
          </PopoverContent>
        </Popover>
        <FormMessage />
      </FormItem>
    )}
  />
);