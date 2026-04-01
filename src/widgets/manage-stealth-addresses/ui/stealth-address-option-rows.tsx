import React from "react";
import { cn } from "@/shared/lib/cn";
import { shortenAddressLineForDisplay } from "../lib/shorten-address-line";

type StealthAddressOptionRowsProperties = {
  addressLabel: string;
  stealthAddress: string;
  className?: string;
};

export function StealthAddressOptionRows({
  addressLabel,
  stealthAddress,
  className,
}: StealthAddressOptionRowsProperties) {
  return (
    <div className={cn("flex flex-col gap-1 text-left", className)}>
      <span className="font-medium leading-tight text-foreground">
        {addressLabel}
      </span>
      <span className="font-mono text-xs leading-tight text-muted-foreground">
        {shortenAddressLineForDisplay(stealthAddress)}
      </span>
    </div>
  );
}
