import type { ReactNode } from "react";
import {
  formatTransactionStatUsd,
  type TransactionStatItem,
} from "../lib/compute-transaction-stats";

type TransactionStatsProperties = {
  stats: TransactionStatItem[];
  resolveLabel: (stat: TransactionStatItem) => string;
  // resolvePendingMeta: (count: number) => string;
};

function MoneyValue({ value }: { value: string }) {
  const match = String(value).match(/^(.+?)(\.\d{2})$/);

  if (!match) {
    return value;
  }

  return (
    <>
      {match[1]}
      <span className="transaction-stat__cents">{match[2]}</span>
    </>
  );
}

export function TransactionStats({
  stats,
  resolveLabel,
  // resolvePendingMeta,
}: TransactionStatsProperties): ReactNode {
  return (
    <div className="transaction-stats" data-count={stats.length}>
      {stats.map((stat) => (
        <div className="transaction-stat" data-tone={stat.tone} key={stat.id}>
          <span className="transaction-stat__label">{resolveLabel(stat)}</span>
          <p className="transaction-stat__value">
            <MoneyValue value={formatTransactionStatUsd(stat.valueUsd)} />
          </p>
          {/* {stat.id === "pending" && stat.pendingCount !== undefined ? (
            <span className="transaction-stat__meta">
              {resolvePendingMeta(stat.pendingCount)}
            </span>
          ) : null} */}
        </div>
      ))}
    </div>
  );
}
