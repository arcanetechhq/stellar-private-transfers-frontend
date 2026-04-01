import React from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2 } from "lucide-react";

import { FONT_WEIGHT_MEDIUM, FONT_WEIGHT_REGULAR, STEP_THREE } from "../model/data-export";

interface StepIndicatorProperties {
  currentStep: number;
}

export function StepIndicator({ currentStep }: StepIndicatorProperties) {
  const { t: translate } = useTranslation("dataExport");

  const steps = [
    { num: 1, title: translate("steps.period") },
    { num: 2, title: translate("steps.dataTypes") },
    { num: 3, title: translate("steps.aggregation") },
    { num: 4, title: translate("steps.format") },
  ];

  return (
    <div
      className="rounded-xl bg-white p-6"
      style={{ border: "1px solid #E6E8EC" }}
    >
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.num} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full font-medium transition-all"
                style={{
                  backgroundColor:
                    currentStep >= step.num ? "#1B1D22" : "#F3F4F6",
                  color: currentStep >= step.num ? "#FFFFFF" : "#9CA3AF",
                  fontSize: "14px",
                }}
              >
                {currentStep > step.num ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  step.num
                )}
              </div>
              <p
                className="mt-2"
                style={{
                  fontSize: "12px",
                  lineHeight: "16px",
                  color: currentStep >= step.num ? "#1B1D22" : "#9CA3AF",
                  fontWeight:
                    currentStep === step.num
                      ? FONT_WEIGHT_MEDIUM
                      : FONT_WEIGHT_REGULAR,
                }}
              >
                {step.title}
              </p>
            </div>
            {index < STEP_THREE && (
              <div
                className="mx-2 mb-6 h-0.5 w-16"
                style={{
                  backgroundColor:
                    currentStep > step.num ? "#1B1D22" : "#E5E7EB",
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
