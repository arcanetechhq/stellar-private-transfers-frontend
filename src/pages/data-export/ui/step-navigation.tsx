import React from "react";
import { useTranslation } from "react-i18next";
import { ChevronRight } from "lucide-react";

import { FONT_WEIGHT_MEDIUM } from "../model/data-export";

interface StepNavigationProperties {
  onBack?: () => void;
  onContinue?: () => void;
  canProceed?: boolean;
}

function BackButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg px-6 py-3 transition-colors"
      style={{
        fontSize: "14px",
        lineHeight: "20px",
        color: "#374151",
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

function ContinueButton({
  onClick,
  disabled,
  label,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-2 rounded-lg px-6 py-3 transition-colors"
      style={{
        fontSize: "14px",
        lineHeight: "20px",
        fontWeight: FONT_WEIGHT_MEDIUM,
        backgroundColor: disabled ? "#E5E7EB" : "#1B1D22",
        color: disabled ? "#9CA3AF" : "#FFFFFF",
      }}
    >
      {label}
      <ChevronRight className="h-4 w-4" />
    </button>
  );
}

export function StepNavigation({
  onBack,
  onContinue,
  canProceed = true,
}: StepNavigationProperties) {
  const { t: translate } = useTranslation("dataExport");

  let justify = "justify-end";
  if (onBack && onContinue) justify = "justify-between";
  else if (onBack) justify = "justify-start";

  return (
    <div className={`mt-6 flex ${justify}`}>
      {onBack && <BackButton onClick={onBack} label={translate("navigation.back")} />}
      {onContinue && (
        <ContinueButton onClick={onContinue} disabled={!canProceed} label={translate("navigation.continue")} />
      )}
    </div>
  );
}
