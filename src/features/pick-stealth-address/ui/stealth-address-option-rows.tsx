import React from "react";
import { cn } from "@/shared/lib/cn";
import { shortenStealthForDisplay } from "../lib/shorten-stealth-for-display";

export interface StealthAddressOptionRowsProperties {
  addressLabel: string;
  stealthAddress: string;
  className?: string;
}

export function StealthAddressOptionRows({
  addressLabel,
  stealthAddress,
  className,
}: StealthAddressOptionRowsProperties) {
  return (
    <div className={cn("flex flex-col gap-1 text-left", className)}>
      <span className="leading-tight font-medium text-[var(--foreground-primary)]">
        {addressLabel}
      </span>
      <span className="font-mono text-xs leading-tight text-[var(--muted-foreground)]">
        {shortenStealthForDisplay(stealthAddress)}
      </span>
    </div>
  );
}
