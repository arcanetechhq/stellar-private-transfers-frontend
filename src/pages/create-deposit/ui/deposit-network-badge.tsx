import React from "react";
import { Globe2 } from "lucide-react";
import type { DepositNetworkOption } from "../lib/deposit-mock-data";

interface DepositNetworkBadgeProperties {
  network: Pick<DepositNetworkOption, "icon" | "label">;
}

export function DepositNetworkBadge({
  network,
}: DepositNetworkBadgeProperties): React.JSX.Element {
  return (
    <span
      className="deposit-network-badge"
      data-has-icon={network.icon ? "true" : "false"}
      aria-hidden="true"
    >
      {network.icon ? (
        <img src={network.icon} alt="" />
      ) : (
        <Globe2 size={22} strokeWidth={1.7} />
      )}
    </span>
  );
}
