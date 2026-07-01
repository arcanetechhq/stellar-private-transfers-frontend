import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { SelectMenu, SelectMenuItem } from "@/shared/ui/select-menu";
import "../styles/period-select.css";

type PeriodSelectOption<T extends string> = {
  value: T;
  label: string;
};

type PeriodSelectProperties<T extends string> = {
  value: T;
  options: Array<PeriodSelectOption<T>>;
  onChange: (value: T) => void;
};

export function PeriodSelect<T extends string>({
  value,
  options,
  onChange,
}: PeriodSelectProperties<T>) {
  const [open, setOpen] = useState(false);
  const rootReference = useRef<HTMLDivElement>(null);
  const activeLabel =
    options.find((option) => option.value === value)?.label ?? value;

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handlePointerDown(event: MouseEvent) {
      if (
        rootReference.current &&
        !rootReference.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className="period-select" ref={rootReference}>
      <button
        type="button"
        className="period-select__button"
        data-open={open}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((current) => !current)}
      >
        <span>{activeLabel}</span>
        <ChevronDown aria-hidden="true" />
      </button>
      {open ? (
        <SelectMenu>
          {options.map((option) => (
            <SelectMenuItem
              key={option.value}
              label={option.label}
              active={option.value === value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            />
          ))}
        </SelectMenu>
      ) : null}
    </div>
  );
}
