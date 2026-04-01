import React from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2 } from "lucide-react";

import {
  DATA_TYPE_OPTIONS,
  FONT_WEIGHT_MEDIUM,
  FONT_WEIGHT_REGULAR,
} from "../model/data-export";
import { StepCard } from "./step-card";
import { StepNavigation } from "./step-navigation";

interface DataTypesStepProperties {
  selectedDataTypes: string[];
  toggleDataType: (id: string) => void;
  selectAllDataTypes: () => void;
  canProceed: boolean;
  onBack: () => void;
  onContinue: () => void;
}

function SelectAllButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg px-3 py-1.5 transition-colors"
      style={{
        fontSize: "13px",
        lineHeight: "18px",
        color: "#1B1D22",
        border: "1px solid #E6E8EC",
        backgroundColor: "#FFFFFF",
      }}
      onMouseEnter={(event) =>
        (event.currentTarget.style.backgroundColor = "#F9FAFB")
      }
      onMouseLeave={(event) =>
        (event.currentTarget.style.backgroundColor = "#FFFFFF")
      }
    >
      {label}
    </button>
  );
}

const DATA_TYPE_LABEL_KEYS: Record<string, string> = {
  all: "dataTypesStep.all",
  sent: "dataTypesStep.sent",
  received: "dataTypesStep.received",
  private: "dataTypesStep.private",
  disclosed: "dataTypesStep.disclosed",
  confirmations: "dataTypesStep.confirmations",
};

export function DataTypesStep({
  selectedDataTypes,
  toggleDataType,
  selectAllDataTypes,
  canProceed,
  onBack,
  onContinue,
}: DataTypesStepProperties) {
  const { t: translate } = useTranslation("dataExport");

  return (
    <StepCard
      title={translate("dataTypesStep.title")}
      description={translate("dataTypesStep.description")}
      headerAction={<SelectAllButton onClick={selectAllDataTypes} label={translate("dataTypesStep.selectAll")} />}
    >
      <div className="flex flex-wrap gap-3">
        {DATA_TYPE_OPTIONS.map((option) => (
          <button
            key={option.id}
            onClick={() => toggleDataType(option.id)}
            className="flex items-center gap-2 rounded-lg px-4 py-2.5 transition-all"
            style={{
              fontSize: "14px",
              lineHeight: "20px",
              border: selectedDataTypes.includes(option.id)
                ? "2px solid #1B1D22"
                : "1px solid #E6E8EC",
              backgroundColor: selectedDataTypes.includes(option.id)
                ? "#1B1D22"
                : "#FFFFFF",
              color: selectedDataTypes.includes(option.id)
                ? "#FFFFFF"
                : "#374151",
              fontWeight: selectedDataTypes.includes(option.id)
                ? FONT_WEIGHT_MEDIUM
                : FONT_WEIGHT_REGULAR,
            }}
          >
            {selectedDataTypes.includes(option.id) && (
              <CheckCircle2 className="h-4 w-4" />
            )}
            {translate(DATA_TYPE_LABEL_KEYS[option.id] ?? option.label)}
          </button>
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
