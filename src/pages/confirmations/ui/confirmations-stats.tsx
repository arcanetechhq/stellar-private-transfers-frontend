import React from "react";
import { useTranslation } from "react-i18next";
import type { Confirmation } from "@/shared/lib/mock";
import {
  countSentConfirmations,
  countViewedConfirmations,
  countUsedConfirmations,
} from "../model/confirmations";

interface StatCardProperties {
  label: string;
  value: number;
}

function StatCard(properties: StatCardProperties) {
  const { label, value } = properties;

  return (
    <div
      className="rounded-xl bg-white p-5"
      style={{ border: "1px solid #E6E8EC" }}
    >
      <p
        className="mb-2"
        style={{
          fontSize: "12px",
          lineHeight: "16px",
          color: "#6B7280",
        }}
      >
        {label}
      </p>
      <p
        className="font-semibold"
        style={{
          fontSize: "28px",
          lineHeight: "36px",
          color: "#1B1D22",
        }}
      >
        {value}
      </p>
    </div>
  );
}

interface ConfirmationsStatsProperties {
  confirmations: Confirmation[];
}

export function ConfirmationsStats(
  properties: ConfirmationsStatsProperties,
) {
  const { confirmations } = properties;
  const { t: translate } = useTranslation("confirmations");

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
      <StatCard label={translate("totalConfirmations")} value={confirmations.length} />
      <StatCard label={translate("sent")} value={countSentConfirmations(confirmations)} />
      <StatCard
        label={translate("viewed")}
        value={countViewedConfirmations(confirmations)}
      />
      <StatCard label={translate("used")} value={countUsedConfirmations(confirmations)} />
    </div>
  );
}
