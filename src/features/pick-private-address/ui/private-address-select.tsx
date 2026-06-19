import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { cn } from "@/shared/lib/cn";
import type { PrivateAddressState } from "@/entities/private-address";
import { PrivateAddressOptionRows } from "@/features/pick-private-address";

export const privateAddressSelectTriggerClassName = cn(
  "h-auto min-h-10 w-full min-w-0 items-start gap-2 border-border-input bg-input-background px-3 py-2 text-foreground shadow-sm",
  "data-[size=default]:h-auto data-[size=default]:min-h-10",
  "whitespace-normal hover:bg-input-background-hover",
  "data-[placeholder]:text-muted-foreground",
  "[&_[data-slot=select-value]]:line-clamp-none [&_[data-slot=select-value]]:w-full [&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:text-left [&_[data-slot=select-value]]:text-foreground",
);

export const privateAddressSelectContentClassName =
  "max-h-72 w-[var(--radix-select-trigger-width)] max-w-none border-border bg-popover p-0 text-popover-foreground shadow-[var(--shadow-dropdown)]";

export const privateAddressSelectItemClassName = cn(
  "items-start rounded-md px-3 py-2.5 pr-9 text-foreground",
  "cursor-pointer focus:bg-muted focus:text-foreground",
  "data-[highlighted]:bg-muted data-[highlighted]:text-foreground",
  "[&_[data-slot=select-item-text]]:w-full [&_[data-slot=select-item-text]]:py-0.5",
);

export const privateAddressSelectLabelClassName =
  "mb-1 block text-[12px] font-medium uppercase leading-[16px] tracking-[0.06em] text-[var(--muted-foreground)]";

export interface PrivateAddressSelectProperties {
  label: string;
  triggerId: string;
  value: string | undefined;
  onValueChange: (value: string) => void;
  placeholder: string;
  nonces: string[];
  byNonce: PrivateAddressState["byNonce"];
  rootClassName?: string;
  labelClassName?: string;
  noLabel?: boolean;
}

export function PrivateAddressSelect({
  label,
  triggerId,
  value,
  onValueChange,
  placeholder,
  nonces,
  byNonce,
  rootClassName,
  labelClassName = privateAddressSelectLabelClassName,
  noLabel = false,
}: PrivateAddressSelectProperties) {
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
          className={privateAddressSelectTriggerClassName}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent
          position="popper"
          sideOffset={4}
          className={privateAddressSelectContentClassName}
        >
          {nonces
            .filter((nonceKey) => Boolean(byNonce[nonceKey]?.privateAddress))
            .map((nonceKey) => {
              const privateAddress = byNonce[nonceKey]?.privateAddress ?? "";
              return (
                <SelectItem
                  key={nonceKey}
                  value={nonceKey}
                  className={privateAddressSelectItemClassName}
                >
                  <PrivateAddressOptionRows
                    addressLabel={nonceKey}
                    privateAddress={privateAddress}
                  />
                </SelectItem>
              );
            })}
        </SelectContent>
      </Select>
    </div>
  );
}
