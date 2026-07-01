import { ArrowLeftRight } from "lucide-react";
import type { TransactionPeriod } from "../model/transactions-panel-filters";
import {
  TransactionsPeriodSelect,
  TransactionsSearchField,
} from "./transactions-search-controls";

type OverviewTransactionsHeaderProperties = {
  title: string;
  searchPlaceholder: string;
  search: string;
  period: TransactionPeriod;
  periodOptions: Array<{ value: TransactionPeriod; label: string }>;
  onSearchChange: (value: string) => void;
  onPeriodChange: (value: TransactionPeriod) => void;
};

export function OverviewTransactionsHeader({
  title,
  searchPlaceholder,
  search,
  period,
  periodOptions,
  onSearchChange,
  onPeriodChange,
}: OverviewTransactionsHeaderProperties) {
  return (
    <div className="transactions-panel__header">
      <div className="transactions-panel__title-group">
        <span className="transactions-panel__icon-frame" aria-hidden="true">
          <ArrowLeftRight />
        </span>
        <h2 className="transactions-panel__title">{title}</h2>
      </div>
      <div className="transactions-panel__actions">
        <div className="transactions-panel__search">
          <TransactionsSearchField
            placeholder={searchPlaceholder}
            value={search}
            onChange={onSearchChange}
            periodControl={
              <TransactionsPeriodSelect
                value={period}
                options={periodOptions}
                onChange={onPeriodChange}
              />
            }
          />
        </div>
      </div>
    </div>
  );
}
