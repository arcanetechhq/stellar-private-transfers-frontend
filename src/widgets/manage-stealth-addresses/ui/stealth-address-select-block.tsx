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
import { StealthAddressOptionRows } from "./stealth-address-option-rows";

type StealthTranslate = (key: string) => string;

type StealthAddressSelectBlockProperties = {
  translate: StealthTranslate;
  nonces: string[];
  byNonce: StealthAddressState["byNonce"];
  normalizedNonce: string | undefined;
  onViewingChange: (value: string) => void;
};

export function StealthAddressSelectBlock({
  translate,
  nonces,
  byNonce,
  normalizedNonce,
  onViewingChange,
}: StealthAddressSelectBlockProperties) {
  return (
    <div className="mb-4 w-full min-w-0">
      <label
        className="mb-1 block text-sm text-foreground-secondary"
        htmlFor="private-address-select"
      >
        {translate("selectPrivateAddress")}
      </label>
      <Select
        value={normalizedNonce ?? undefined}
        onValueChange={onViewingChange}
      >
        <SelectTrigger
          id="private-address-select"
          size="default"
          className={cn(
            "h-auto min-h-10 w-full min-w-0 items-start gap-2 border-border-input bg-input-background px-3 py-2 text-foreground shadow-sm",
            "data-[size=default]:h-auto data-[size=default]:min-h-10",
            "whitespace-normal hover:bg-input-background-hover",
            "data-[placeholder]:text-muted-foreground",
            "[&_[data-slot=select-value]]:line-clamp-none [&_[data-slot=select-value]]:w-full [&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:text-left [&_[data-slot=select-value]]:text-foreground",
          )}
        >
          <SelectValue placeholder={translate("selectPlaceholder")} />
        </SelectTrigger>
        <SelectContent
          position="popper"
          sideOffset={4}
          className="max-h-72 w-[var(--radix-select-trigger-width)] max-w-none border-border bg-popover p-0 text-popover-foreground shadow-[var(--shadow-dropdown)]"
        >
          {nonces.map((nonceKey) => {
              const stealthAddress = byNonce[nonceKey]?.stealthAddress;
              if (!stealthAddress) {
                return;
              }
              return (
                <SelectItem
                  key={nonceKey}
                  value={nonceKey}
                  className={cn(
                    "items-start rounded-md px-3 py-2.5 pr-9 text-foreground",
                    "cursor-pointer focus:bg-muted focus:text-foreground",
                    "data-[highlighted]:bg-muted data-[highlighted]:text-foreground",
                    "[&_[data-slot=select-item-text]]:w-full [&_[data-slot=select-item-text]]:py-0.5",
                  )}
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
