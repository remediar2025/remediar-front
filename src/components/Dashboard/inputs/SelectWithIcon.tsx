import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { JSX } from "react";

type Option<T extends string> = T | { label: string; value: T };

interface SelectWithIconProps<T extends string> {
  icon: JSX.Element;
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (valor: T) => void;
}

export default function SelectWithIcon<T extends string>({
  icon,
  label,
  options,
  value,
  onChange,
}: SelectWithIconProps<T>) {
  return (
    <div className="space-y-2">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none z-10">
          {icon}
        </div>
        <Select value={value} onValueChange={(valor: T) => onChange(valor)}>
          <SelectTrigger className="pl-14 h-24 py-7.5 text-base border-2 rounded-md w-full bg-white">
            <SelectValue placeholder={label} />
          </SelectTrigger>
          <SelectContent className="z-50">
            {options.map((opt) => {
              if (typeof opt === "string") {
                return (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                );
              } else {
                return (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                );
              }
            })}
          </SelectContent>
        </Select>
      </div>
      <div className="text-base text-gray-500 pl-3">{label}</div>
    </div>
  );
}
