"use client";

import * as React from "react";

export const THEMES = { light: "", dark: ".dark" } as const;

export type ChartConfig = {
  [key in string]: {
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

export const ChartContext = React.createContext<
  ChartContextProperties | undefined
>(undefined);

export function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }

  return context;
}

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
