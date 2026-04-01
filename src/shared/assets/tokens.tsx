import React from "react";
import svgPaths from "./svg-tokens-secondary";

export default function Tokens() {
  return (
    <div className="relative size-full overflow-clip rounded-[100px]" data-name="tokens">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <path d={svgPaths.pde68500} fill="var(--fill-0, #F5B300)" id="bg" />
      </svg>
      <div className="absolute inset-[16.25%_27.09%_17.08%_22.45%]" data-name="Group">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12.1084 16">
          <g id="Group">
            <path d={svgPaths.p42e2480} fill="var(--fill-0, white)" id="Vector" />
          </g>
        </svg>
      </div>
    </div>
  );
}