import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { ChevronDown } from "lucide-react";
import { SelectMenu, SelectMenuItem } from "@/shared/ui/select-menu";

type ExportSelectOption<T extends string> = {
  label: string;
  value: T;
};

type ExportSelectFieldProperties<T extends string> = {
  label: string;
  options: Array<ExportSelectOption<T>>;
  value: T;
  icon?: LucideIcon;
  onChange: (value: T) => void;
};

export function ExportSelectField<T extends string>({
  label,
  options,
  value,
  icon: Icon,
  onChange,
}: ExportSelectFieldProperties<T>) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value) ?? options[0];

  function handleSelect(option: ExportSelectOption<T>) {
    onChange(option.value);
    setOpen(false);
  }

  return (
    <div className="export-select" data-open={open}>
      <button
        type="button"
        className="export-select__button"
        onClick={() => setOpen((next) => !next)}
      >
        <span className="export-select__label">{label}</span>
        <span className="export-select__value">
          {Icon ? <Icon size={16} strokeWidth={1.6} /> : null}
          <span>{selected.label}</span>
          <ChevronDown size={24} strokeWidth={1.6} />
        </span>
      </button>
      {open ? (
        <SelectMenu className="export-select__menu" role="menu">
          {options.map((option) => (
            <SelectMenuItem
              key={option.value}
              label={option.label}
              active={option.value === value}
              role="menuitem"
              onClick={() => handleSelect(option)}
            />
          ))}
        </SelectMenu>
      ) : null}
    </div>
  );
}
