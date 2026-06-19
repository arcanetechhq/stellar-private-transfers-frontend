import React from "react";
import { cn } from "@/shared/lib/cn";
import { shortenPrivateAddressForDisplay } from "@/shared/lib/private-address/shorten-private-address-for-display";

export interface PrivateAddressOptionRowsProperties {
  addressLabel: string;
  privateAddress: string;
  className?: string;
}

export function PrivateAddressOptionRows({
  addressLabel,
  privateAddress,
  className,
}: PrivateAddressOptionRowsProperties) {
  return (
    <div className={cn("flex flex-col gap-1 text-left", className)}>
      <span className="leading-tight font-medium text-[var(--foreground-primary)]">
        {addressLabel}
      </span>
      <span className="font-mono text-xs leading-tight text-[var(--muted-foreground)]">
        {shortenPrivateAddressForDisplay(privateAddress)}
      </span>
    </div>
  );
}
