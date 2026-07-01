"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";

import { cn } from "@/shared/lib/cn";

import {
  type ChartConfig,
  getPayloadConfigFromPayload,
  useChart,
} from "./chart";
import {
  type IndicatorStyle,
  type TooltipPayload,
  TooltipPayloadItem,
  resolvePayloadKey,
} from "./chart-tooltip-item";

function resolveTooltipValue(options: {
  labelKey: string | undefined;
  label: React.ComponentProps<typeof RechartsPrimitive.Tooltip>["label"];
  config: ChartConfig;
  itemConfig: ReturnType<typeof getPayloadConfigFromPayload>;
}) {
  const { labelKey, label, config, itemConfig } = options;
  if (labelKey) {
    return itemConfig?.label;
  }
  if (typeof label === "string") {
    return config[label as keyof typeof config]?.label || label;
  }
  return itemConfig?.label;
}

function getTooltipLabel(parameters: {
  hideLabel: boolean;
  payload: TooltipPayload[] | undefined;
  labelKey?: string;
  config: ChartConfig;
  label: React.ComponentProps<typeof RechartsPrimitive.Tooltip>["label"];
  labelFormatter: React.ComponentProps<
    typeof RechartsPrimitive.Tooltip
  >["labelFormatter"];
  labelClassName?: string;
}): React.ReactNode {
  const { hideLabel, payload, labelKey, config, label, labelFormatter, labelClassName } =
    parameters;

  if (hideLabel || !payload?.length) {
    return;
  }

  const [item] = payload;
  const key = resolvePayloadKey(labelKey, item);
  const itemConfig = getPayloadConfigFromPayload(config, { payload: item, key });
  const value = resolveTooltipValue({ labelKey, label, config, itemConfig });

  if (labelFormatter) {
    return (
      <div className={cn("font-medium", labelClassName)}>
        {labelFormatter(value, payload)}
      </div>
    );
  }

  if (!value) {
    return;
  }

  return <div className={cn("font-medium", labelClassName)}>{value}</div>;
}

export function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
}: React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
  React.ComponentProps<"div"> & {
    hideLabel?: boolean;
    hideIndicator?: boolean;
    indicator?: IndicatorStyle;
    nameKey?: string;
    labelKey?: string;
  }) {
  const { config } = useChart();

  const tooltipLabel = React.useMemo(
    () =>
      getTooltipLabel({
        hideLabel,
        payload: payload as TooltipPayload[] | undefined,
        labelKey,
        config,
        label,
        labelFormatter,
        labelClassName,
      }),
    [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey],
  );

  if (!active || !payload?.length) {
    return;
  }

  const nestLabel = payload.length === 1 && indicator !== "dot";

  return (
    <div
      className={cn(
        "border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl",
        className,
      )}
    >
      {nestLabel ? undefined : tooltipLabel}
      <div className="grid gap-1.5">
        {payload.map((item, index) => (
          <TooltipPayloadItem
            key={item.dataKey}
            color={color}
            config={config}
            formatter={formatter}
            hideIndicator={hideIndicator}
            index={index}
            indicator={indicator}
            item={item as TooltipPayload}
            nameKey={nameKey}
            nestLabel={nestLabel}
            tooltipLabel={tooltipLabel}
          />
        ))}
      </div>
    </div>
  );
}
