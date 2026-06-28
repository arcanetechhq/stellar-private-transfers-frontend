import React from "react";
import { cn } from "@/shared/lib/cn";

type SummaryRow = {
  label: React.ReactNode;
  value: React.ReactNode;
  valueClassName?: string;
};

type SummaryRowsProperties = {
  rows: SummaryRow[];
};

export function SummaryRows({ rows }: SummaryRowsProperties) {
  return (
    <div className="mb-6 space-y-3">
      {rows.map((row, index) => (
        <div key={index} className="flex justify-between">
          <span className="text-sm leading-5 text-[var(--foreground-secondary)]">
            {row.label}
          </span>
          <span
            className={cn(
              "text-sm leading-5 font-semibold text-[var(--foreground-primary)]",
              row.valueClassName,
            )}
          >
            {row.value}
          </span>
        </div>
      ))}
    </div>
  );
}
