import { useMemo, useState } from "react";
import "./monthly-net-insights.css";
import { PieChart } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Transaction } from "@/entities/transaction";
import type { MonthlyNetPeriod } from "../model/monthly-net-period";
import {
  computeMonthlyNetStats,
  formatMonthlyNetUsd,
  formatSignedMonthlyNetUsd,
} from "../lib/compute-monthly-net";
import { MoneyFigure } from "./money-figure";
import { MonthlyNetPeriodSelect } from "./monthly-net-period-select";

type MonthlyNetInsightsProperties = {
  transactions: Transaction[];
};

export function MonthlyNetInsights({
  transactions,
}: MonthlyNetInsightsProperties) {
  const { t: translate } = useTranslation("overview");
  const [period, setPeriod] = useState<MonthlyNetPeriod>("thisMonth");

  const periodOptions = useMemo(
    () => [
      {
        value: "thisMonth" as const,
        label: translate("monthlyNet.periods.thisMonth"),
      },
      {
        value: "lastMonth" as const,
        label: translate("monthlyNet.periods.lastMonth"),
      },
      {
        value: "thisQuarter" as const,
        label: translate("monthlyNet.periods.thisQuarter"),
      },
    ],
    [translate],
  );

  const stats = useMemo(
    () => computeMonthlyNetStats({ transactions, period }),
    [period, transactions],
  );

  return (
    <section className="monthly-net-insights ui-card">
      <div className="monthly-net-insights__header">
        <div className="monthly-net-insights__title-group">
          <span className="monthly-net-insights__icon-frame" aria-hidden="true">
            <PieChart />
          </span>
          <h2 className="monthly-net-insights__title">
            {translate("monthlyNet.title")}
          </h2>
        </div>
        <MonthlyNetPeriodSelect
          value={period}
          options={periodOptions}
          onChange={setPeriod}
        />
      </div>

      <div
        className="monthly-net-insights__net-row"
        data-tone={stats.netTone}
      >
        <span className="monthly-net-insights__net-indicator" aria-hidden />
        <MoneyFigure
          value={formatSignedMonthlyNetUsd(stats.netUsd)}
          size="hero"
          tone={stats.netTone}
        />
      </div>

      <div className="monthly-net-insights__breakdown">
        <div
          className="monthly-net-insights__breakdown-item"
          data-tone="positive"
        >
          <span className="monthly-net-insights__breakdown-content">
            <span className="monthly-net-insights__breakdown-label">
              {translate("monthlyNet.inflow")}
            </span>
            <MoneyFigure
              value={formatMonthlyNetUsd(stats.inflowUsd)}
              tone="default"
            />
          </span>
        </div>
        <div
          className="monthly-net-insights__breakdown-item"
          data-tone="muted"
        >
          <span className="monthly-net-insights__breakdown-content">
            <span className="monthly-net-insights__breakdown-label">
              {translate("monthlyNet.outflow")}
            </span>
            <MoneyFigure
              value={formatMonthlyNetUsd(stats.outflowUsd)}
              tone="default"
            />
          </span>
        </div>
      </div>
    </section>
  );
}
