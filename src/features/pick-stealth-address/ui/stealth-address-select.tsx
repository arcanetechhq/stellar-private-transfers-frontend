import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { cn } from "@/shared/lib/cn";
import type { StealthAddressState } from "@/entities/stealth-address";
import { StealthAddressOptionRows } from "@/features/pick-stealth-address";

export const stealthAddressSelectTriggerClassName = cn(
  "h-auto min-h-10 w-full min-w-0 items-start gap-2 border-border-input bg-input-background px-3 py-2 text-foreground shadow-sm",
  "data-[size=default]:h-auto data-[size=default]:min-h-10",
  "whitespace-normal hover:bg-input-background-hover",
  "data-[placeholder]:text-muted-foreground",
  "[&_[data-slot=select-value]]:line-clamp-none [&_[data-slot=select-value]]:w-full [&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:text-left [&_[data-slot=select-value]]:text-foreground",
);

export const stealthAddressSelectContentClassName =
  "max-h-72 w-[var(--radix-select-trigger-width)] max-w-none border-border bg-popover p-0 text-popover-foreground shadow-[var(--shadow-dropdown)]";

export const stealthAddressSelectItemClassName = cn(
  "items-start rounded-md px-3 py-2.5 pr-9 text-foreground",
  "cursor-pointer focus:bg-muted focus:text-foreground",
  "data-[highlighted]:bg-muted data-[highlighted]:text-foreground",
  "[&_[data-slot=select-item-text]]:w-full [&_[data-slot=select-item-text]]:py-0.5",
);

export const stealthAddressSelectLabelClassName =
  "mb-1 block text-[12px] font-medium uppercase leading-[16px] tracking-[0.06em] text-[var(--muted-foreground)]";

export interface StealthAddressSelectProperties {
  label: string;
  triggerId: string;
  value: string | undefined;
  onValueChange: (value: string) => void;
  placeholder: string;
  nonces: string[];
  byNonce: StealthAddressState["byNonce"];
  rootClassName?: string;
  labelClassName?: string;
  noLabel?: boolean;
}

export function StealthAddressSelect({
  label,
  triggerId,
  value,
  onValueChange,
  placeholder,
  nonces,
  byNonce,
  rootClassName,
  labelClassName = stealthAddressSelectLabelClassName,
  noLabel = false,
}: StealthAddressSelectProperties) {
  return (
    <div className={cn("w-full min-w-0", rootClassName)}>
      {noLabel ? undefined : (
        <label className={labelClassName} htmlFor={triggerId}>
          {label}
        </label>
      )}
      <Select value={value ?? undefined} onValueChange={onValueChange}>
        <SelectTrigger
          id={triggerId}
          size="default"
          className={stealthAddressSelectTriggerClassName}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent
          position="popper"
          sideOffset={4}
          className={stealthAddressSelectContentClassName}
        >
          {nonces
            .filter((nonceKey) => Boolean(byNonce[nonceKey]?.stealthAddress))
            .map((nonceKey) => {
              const stealthAddress = byNonce[nonceKey]?.stealthAddress ?? "";
              return (
                <SelectItem
                  key={nonceKey}
                  value={nonceKey}
                  className={stealthAddressSelectItemClassName}
                >
                  <StealthAddressOptionRows
                    addressLabel={nonceKey}
                    stealthAddress={stealthAddress}
                  />
                </SelectItem>
              );
            })}
        </SelectContent>
      </Select>
    </div>
  );
}
