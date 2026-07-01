"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";

import { cn } from "@/shared/lib/cn";

const THEMES = { light: "", dark: "[data-theme='dark']" } as const;

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  );
};

type ChartContextProperties = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProperties | undefined>(
  undefined,
);

export function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }

  return context;
}

export function ChartContainer({
  id,
  className,
  children,
  config,
  ...properties
}: React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >["children"];
}) {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replaceAll(":", "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border flex aspect-video justify-center text-xs [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
          className,
        )}
        {...properties}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

export const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, itemConfig]) => itemConfig.theme || itemConfig.color,
  );

  if (colorConfig.length === 0) {
    return;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color;
    return color ? `  --color-${key}: ${color};` : undefined;
  })
  .join("\n")}
}
`,
          )
          .join("\n"),
      }}
    />
  );
};

export const ChartTooltip = RechartsPrimitive.Tooltip;

export const ChartLegend = RechartsPrimitive.Legend;

export function getRecordValueAsString(
  record: Record<string, unknown>,
  key: string,
) {
  if (!(key in record)) {
    return;
  }

  const value = record[key];
  return typeof value === "string" ? value : undefined;
}

export function getPayloadConfigFromPayload(
  config: ChartConfig,
  options: { payload: unknown; key: string },
) {
  const { payload, key } = options;
  if (typeof payload !== "object" || !payload) {
    return;
  }

  const payloadRecord = payload as Record<string, unknown>;
  const nestedPayloadValue = payloadRecord.payload;
  const nestedPayloadRecord =
    typeof nestedPayloadValue === "object" && nestedPayloadValue
      ? (nestedPayloadValue as Record<string, unknown>)
      : undefined;

  let configLabelKey: string = key;

  const labelFromPayload = getRecordValueAsString(payloadRecord, key);
  const labelFromNestedPayload = nestedPayloadRecord
    ? getRecordValueAsString(nestedPayloadRecord, key)
    : undefined;

  if (labelFromPayload) {
    configLabelKey = labelFromPayload;
  } else if (labelFromNestedPayload) {
    configLabelKey = labelFromNestedPayload;
  }

  return configLabelKey in config
    ? config[configLabelKey]
    : config[key as keyof typeof config];
}

export { ChartTooltipContent } from "./chart-tooltip";
export { ChartLegendContent } from "./chart-legend";
