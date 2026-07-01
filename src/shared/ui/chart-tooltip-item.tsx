"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";

import { cn } from "@/shared/lib/cn";

import { type ChartConfig, getPayloadConfigFromPayload } from "./chart";

type TooltipPayload = NonNullable<
  React.ComponentProps<typeof RechartsPrimitive.Tooltip>["payload"]
>[number];

type IndicatorStyle = "line" | "dot" | "dashed";

function resolvePayloadKey(
  preferredKey: string | undefined,
  item: TooltipPayload | undefined,
) {
  return `${preferredKey || item?.dataKey || item?.name || "value"}`;
}

function TooltipSeriesIndicator({
  indicator,
  indicatorColor,
  nestLabel,
}: {
  indicator: IndicatorStyle;
  indicatorColor: string | undefined;
  nestLabel: boolean;
}) {
  return (
    <div
      className={cn(
        "shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)",
        {
          "h-2.5 w-2.5": indicator === "dot",
          "w-1": indicator === "line",
          "w-0 border-[1.5px] border-dashed bg-transparent":
            indicator === "dashed",
          "my-0.5": nestLabel && indicator === "dashed",
        },
      )}
      style={
        {
          "--color-bg": indicatorColor,
          "--color-border": indicatorColor,
        } as React.CSSProperties
      }
    />
  );
}

function TooltipPayloadDefaultContent({
  itemConfig,
  hideIndicator,
  indicator,
  indicatorColor,
  nestLabel,
  tooltipLabel,
  item,
}: {
  itemConfig: ReturnType<typeof getPayloadConfigFromPayload>;
  hideIndicator: boolean;
  indicator: IndicatorStyle;
  indicatorColor: string | undefined;
  nestLabel: boolean;
  tooltipLabel: React.ReactNode;
  item: TooltipPayload;
}) {
  return (
    <>
      {itemConfig?.icon ? (
        <itemConfig.icon />
      ) : (
        !hideIndicator && (
          <TooltipSeriesIndicator
            indicator={indicator}
            indicatorColor={indicatorColor}
            nestLabel={nestLabel}
          />
        )
      )}
      <div
        className={cn(
          "flex flex-1 justify-between leading-none",
          nestLabel ? "items-end" : "items-center",
        )}
      >
        <div className="grid gap-1.5">
          {nestLabel ? tooltipLabel : undefined}
          <span className="text-muted-foreground">
            {itemConfig?.label || item.name}
          </span>
        </div>
        {item.value && (
          <span className="text-foreground font-mono font-medium tabular-nums">
            {item.value.toLocaleString()}
          </span>
        )}
      </div>
    </>
  );
}

export type TooltipPayloadItemProperties = {
  item: TooltipPayload;
  index: number;
  nameKey?: string;
  formatter: React.ComponentProps<
    typeof RechartsPrimitive.Tooltip
  >["formatter"];
  hideIndicator: boolean;
  indicator: IndicatorStyle;
  color?: string;
  nestLabel: boolean;
  tooltipLabel: React.ReactNode;
  config: ChartConfig;
};

export function TooltipPayloadItem(properties: TooltipPayloadItemProperties) {
  const {
    item, index, nameKey, formatter, hideIndicator,
    indicator, color, nestLabel, tooltipLabel, config,
  } = properties;
  const key = resolvePayloadKey(nameKey, item);
  const itemConfig = getPayloadConfigFromPayload(config, { payload: item, key });
  const indicatorColor = color || item.payload.fill || item.color;
  const wrapperClass = cn(
    "[&>svg]:text-muted-foreground flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5",
    indicator === "dot" && "items-center",
  );

  if (formatter && item?.value !== undefined && item.name) {
    return (
      <div className={wrapperClass}>
        {formatter(item.value, item.name, item, index, item.payload)}
      </div>
    );
  }

  return (
    <div className={wrapperClass}>
      <TooltipPayloadDefaultContent
        itemConfig={itemConfig}
        hideIndicator={hideIndicator}
        indicator={indicator}
        indicatorColor={indicatorColor}
        nestLabel={nestLabel}
        tooltipLabel={tooltipLabel}
        item={item}
      />
    </div>
  );
}

export { type TooltipPayload, type IndicatorStyle, resolvePayloadKey };
