import React from "react";
import { useTranslation } from "react-i18next";

import {
  type AggregationLevel,
  FONT_WEIGHT_MEDIUM,
  FONT_WEIGHT_REGULAR,
} from "../model/data-export";
import { StepCard } from "./step-card";
import { StepNavigation } from "./step-navigation";

const AGGREGATION_OPTION_KEYS = [
  { value: "detailed" as const, labelKey: "aggregationStep.detailed", descKey: "aggregationStep.detailedDesc" },
  { value: "daily" as const, labelKey: "aggregationStep.daily", descKey: "aggregationStep.dailyDesc" },
  { value: "asset" as const, labelKey: "aggregationStep.asset", descKey: "aggregationStep.assetDesc" },
  { value: "counterparty" as const, labelKey: "aggregationStep.counterparty", descKey: "aggregationStep.counterpartyDesc" },
];

interface AggregationStepProperties {
  aggregation: AggregationLevel;
  setAggregation: (value: AggregationLevel) => void;
  canProceed: boolean;
  onBack: () => void;
  onContinue: () => void;
}

export function AggregationStep({
  aggregation,
  setAggregation,
  canProceed,
  onBack,
  onContinue,
}: AggregationStepProperties) {
  const { t: translate } = useTranslation("dataExport");

  return (
    <StepCard
      title={translate("aggregationStep.title")}
      description={translate("aggregationStep.description")}
    >
      <div className="space-y-3">
        {AGGREGATION_OPTION_KEYS.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-start gap-3 rounded-lg p-4 transition-all"
            style={{
              border:
                aggregation === option.value
                  ? "2px solid #1B1D22"
                  : "1px solid #E6E8EC",
              backgroundColor:
                aggregation === option.value ? "#F9FAFB" : "#FFFFFF",
            }}
          >
            <input
              type="radio"
              name="aggregation"
              value={option.value}
              checked={aggregation === option.value}
              onChange={() => setAggregation(option.value)}
              className="mt-0.5 h-5 w-5"
              style={{ accentColor: "#1B1D22" }}
            />
            <div className="flex-1">
              <p
                style={{
                  fontSize: "15px",
                  lineHeight: "22px",
                  color: "#1B1D22",
                  fontWeight:
                    aggregation === option.value
                      ? FONT_WEIGHT_MEDIUM
                      : FONT_WEIGHT_REGULAR,
                }}
              >
                {translate(option.labelKey)}
              </p>
              <p
                className="mt-1"
                style={{
                  fontSize: "13px",
                  lineHeight: "18px",
                  color: "#6B7280",
                }}
              >
                {translate(option.descKey)}
              </p>
            </div>
          </label>
        ))}
      </div>
      <StepNavigation
        onBack={onBack}
        onContinue={onContinue}
        canProceed={canProceed}
      />
    </StepCard>
  );
}
