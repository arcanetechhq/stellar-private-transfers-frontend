import React from "react";

interface DepositActivityLoaderProperties {
  label?: string;
}

export function DepositActivityLoader({
  label = "Loading",
}: DepositActivityLoaderProperties): React.JSX.Element {
  return (
    <span className="activity-loader" role="status" aria-label={label}>
      <span className="activity-loader__spinner" aria-hidden="true" />
    </span>
  );
}
