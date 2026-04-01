import React from "react";
import svgPaths from "./svg-hmlokzcsue";

export default function EthereumEth({ className }: { className?: string }) {
  return (
    <div className={className || "relative"} data-name="Ethereum (ETH)">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 120 120">
        <g id="Ethereum (ETH)">
          <circle cx="60" cy="60" fill="var(--fill-0, #EDF0F4)" id="Ethereum (ETH)_2" r="60" />
          <g id="Ethereum (ETH)_3">
            <path d={svgPaths.p17537f00} fill="var(--fill-0, #343434)" id="Ethereum (ETH)_4" />
            <path d={svgPaths.p2ea7cfc0} fill="var(--fill-0, #8C8C8C)" id="Ethereum (ETH)_5" />
            <path d={svgPaths.p2c4ae380} fill="var(--fill-0, #3C3C3B)" id="Ethereum (ETH)_6" />
            <path d={svgPaths.p2dc40df0} fill="var(--fill-0, #8C8C8C)" id="Ethereum (ETH)_7" />
            <path d={svgPaths.p350cc500} fill="var(--fill-0, #141414)" id="Ethereum (ETH)_8" />
            <path d={svgPaths.p3316c380} fill="var(--fill-0, #393939)" id="Ethereum (ETH)_9" />
          </g>
        </g>
      </svg>
    </div>
  );
}
