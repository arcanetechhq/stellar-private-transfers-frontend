import React from "react";
import { useTranslation } from "react-i18next";

import { FONT_WEIGHT_MEDIUM, FONT_WEIGHT_REGULAR } from "../model/data-export";
import { StepCard } from "./step-card";
import { StepNavigation } from "./step-navigation";

const PERIOD_OPTION_KEYS = [
  { value: "last-7", key: "periodStep.last7" },
  { value: "last-30", key: "periodStep.last30" },
  { value: "last-90", key: "periodStep.last90" },
  { value: "current-year", key: "periodStep.currentYear" },
  { value: "custom", key: "periodStep.custom" },
] as const;

interface PeriodStepProperties {
  period: string;
  setPeriod: (value: string) => void;
  customDateStart: string;
  setCustomDateStart: (value: string) => void;
  customDateEnd: string;
  setCustomDateEnd: (value: string) => void;
  canProceed: boolean;
  onContinue: () => void;
}

const DATE_LABEL_STYLE = {
  fontSize: "13px",
  lineHeight: "18px",
  color: "#374151",
  fontWeight: FONT_WEIGHT_MEDIUM,
};

const DATE_INPUT_STYLE = {
  border: "1px solid #E6E8EC",
  fontSize: "14px",
  color: "#1B1D22",
};

function CustomDateRange({
  customDateStart,
  setCustomDateStart,
  customDateEnd,
  setCustomDateEnd,
}: Pick<
  PeriodStepProperties,
  "customDateStart" | "setCustomDateStart" | "customDateEnd" | "setCustomDateEnd"
>) {
  const { t: translate } = useTranslation("dataExport");

  return (
    <div
      className="mt-4 grid grid-cols-2 gap-4 rounded-lg p-4"
      style={{ backgroundColor: "#F9FAFB" }}
    >
      <div>
        <label className="mb-2 block" style={DATE_LABEL_STYLE}>
          {translate("periodStep.startDate")}
        </label>
        <input
          type="date"
          value={customDateStart}
          onChange={(event) => setCustomDateStart(event.target.value)}
          className="w-full rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          style={DATE_INPUT_STYLE}
        />
      </div>
      <div>
        <label className="mb-2 block" style={DATE_LABEL_STYLE}>
          {translate("periodStep.endDate")}
        </label>
        <input
          type="date"
          value={customDateEnd}
          onChange={(event) => setCustomDateEnd(event.target.value)}
          className="w-full rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          style={DATE_INPUT_STYLE}
        />
      </div>
    </div>
  );
}

export function PeriodStep({
  period,
  setPeriod,
  customDateStart,
  setCustomDateStart,
  customDateEnd,
  setCustomDateEnd,
  canProceed,
  onContinue,
}: PeriodStepProperties) {
  const { t: translate } = useTranslation("dataExport");

  return (
    <StepCard
      title={translate("periodStep.title")}
      description={translate("periodStep.description")}
    >
      <div className="space-y-3">
        {PERIOD_OPTION_KEYS.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-center gap-3 rounded-lg p-4 transition-all"
            style={{
              border:
                period === option.value
                  ? "2px solid #1B1D22"
                  : "1px solid #E6E8EC",
              backgroundColor:
                period === option.value ? "#F9FAFB" : "#FFFFFF",
            }}
          >
            <input
              type="radio"
              name="period"
              value={option.value}
              checked={period === option.value}
              onChange={(event) => setPeriod(event.target.value)}
              className="h-5 w-5"
              style={{ accentColor: "#1B1D22" }}
            />
            <span
              style={{
                fontSize: "15px",
                lineHeight: "22px",
                color: "#1B1D22",
                fontWeight:
                  period === option.value
                    ? FONT_WEIGHT_MEDIUM
                    : FONT_WEIGHT_REGULAR,
              }}
            >
              {translate(option.key)}
            </span>
          </label>
        ))}
      </div>
      {period === "custom" && (
        <CustomDateRange
          customDateStart={customDateStart}
          setCustomDateStart={setCustomDateStart}
          customDateEnd={customDateEnd}
          setCustomDateEnd={setCustomDateEnd}
        />
      )}
      <StepNavigation onContinue={onContinue} canProceed={canProceed} />
    </StepCard>
  );
}
