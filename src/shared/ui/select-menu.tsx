import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/shared/lib/cn";

type SelectMenuProperties = {
  children: ReactNode;
  className?: string;
  role?: "listbox" | "menu";
};

export function SelectMenu({
  children,
  className,
  role = "listbox",
}: SelectMenuProperties) {
  return (
    <div className={cn("select-menu", className)} role={role}>
      {children}
    </div>
  );
}

type SelectMenuItemProperties = {
  label: string;
  active: boolean;
  onClick: () => void;
  role?: "option" | "menuitem";
};

export function SelectMenuItem({
  label,
  active,
  onClick,
  role = "option",
}: SelectMenuItemProperties) {
  return (
    <button
      type="button"
      className="select-menu__item"
      data-active={active}
      role={role}
      aria-selected={role === "option" ? active : undefined}
      onClick={onClick}
    >
      <span>{label}</span>
      {active ? <Check size={14} strokeWidth={1.5} aria-hidden="true" /> : null}
    </button>
  );
}
