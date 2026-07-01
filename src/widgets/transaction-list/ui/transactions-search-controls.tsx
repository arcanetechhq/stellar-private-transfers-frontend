import { Search } from "lucide-react";
import type { ReactNode } from "react";
import { PeriodSelect } from "@/shared/ui/period-select";
import type { TransactionPeriod } from "../model/transactions-panel-filters";

type TransactionsSearchFieldProperties = {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  periodControl?: ReactNode;
};

export function TransactionsSearchField({
  placeholder,
  value,
  onChange,
  periodControl,
}: TransactionsSearchFieldProperties) {
  return (
    <label
      className="transactions-search-field"
      data-has-right-control={periodControl ? "true" : undefined}
    >
      <Search aria-hidden="true" />
      <input
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      {periodControl}
    </label>
  );
}

type TransactionsPeriodSelectProperties = {
  value: TransactionPeriod;
  options: Array<{ value: TransactionPeriod; label: string }>;
  onChange: (value: TransactionPeriod) => void;
};

export function TransactionsPeriodSelect({
  value,
  options,
  onChange,
}: TransactionsPeriodSelectProperties) {
  return (
    <PeriodSelect value={value} options={options} onChange={onChange} />
  );
}
