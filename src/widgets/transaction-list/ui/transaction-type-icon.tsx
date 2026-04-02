import React from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowRightLeft,
} from "lucide-react";

interface TransactionTypeIconProperties {
  type: string;
}

interface IconConfig {
  IconComponent: React.ElementType;
  color: string;
  background: string;
}

const iconConfigMap: Record<string, IconConfig> = {
  deposit: {
    IconComponent: ArrowDownToLine,
    color: "#3B82F6",
    background: "#EFF6FF",
  },
  sent: {
    IconComponent: ArrowUpRight,
    color: "#EF4444",
    background: "#FEF2F2",
  },
  received: {
    IconComponent: ArrowDownRight,
    color: "#10B981",
    background: "#ECFDF5",
  },
  withdrawal: {
    IconComponent: ArrowUpFromLine,
    color: "#6B7280",
    background: "#F3F4F6",
  },
};

const defaultIconConfig: IconConfig = {
  IconComponent: ArrowRightLeft,
  color: "#6B7280",
  background: "#F3F4F6",
};

export function TransactionTypeIcon(
  properties: TransactionTypeIconProperties,
) {
  const config = iconConfigMap[properties.type] ?? defaultIconConfig;
  const { IconComponent, color, background } = config;

  return (
    <div
      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
      style={{ backgroundColor: background }}
    >
      <IconComponent className="h-4 w-4" style={{ color }} />
    </div>
  );
}
