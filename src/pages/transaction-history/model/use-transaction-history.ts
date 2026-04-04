import { useState } from "react";
import { useAppSelector } from "@/app/hooks";
import {
  selectTransactions,
  sortTransactionsByDateDesc,
} from "@/entities/transaction";
import type { DateFilterValue, FilterType } from "./transaction-history";
import { dateFilterOptions } from "./transaction-history";
import { isTransactionInDateRange } from "../lib/date-filter";

function getTypeMatch(options: {
  filterType: FilterType;
  transactionType: string;
}) {
  const { filterType, transactionType } = options;

  if (filterType === "all") {
    return true;
  }

  if (filterType === "deposits") {
    return transactionType === "deposit";
  }

  if (filterType === "transfers") {
    return transactionType === "sent" || transactionType === "received";
  }

  if (filterType === "withdrawals") {
    return transactionType === "withdrawal";
  }

  return false;
}

export function useTransactionHistory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [dateFilterOpen, setDateFilterOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateFilterValue>("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const allTransactions = sortTransactionsByDateDesc(
    useAppSelector(selectTransactions),
  );

  const dateLabel =
    dateFilterOptions.find((option) => option.value === dateFilter)?.label ??
    "dateFilters.allTime";

  const filteredTransactions = allTransactions.filter((transaction) => {
    const lowerQuery = searchQuery.toLowerCase();
    const matchesSearch =
      transaction.id.toLowerCase().includes(lowerQuery) ||
      transaction.counterparty.toLowerCase().includes(lowerQuery) ||
      transaction.assetId.toLowerCase().includes(lowerQuery);

    const matchesType = getTypeMatch({
      filterType,
      transactionType: transaction.type,
    });

    const matchesDate = isTransactionInDateRange({
      transactionDateRaw: transaction.date,
      dateFilter,
      customStartDate,
      customEndDate,
    });

    return matchesSearch && matchesType && matchesDate;
  });

  return {
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    dateFilterOpen,
    setDateFilterOpen,
    dateFilter,
    setDateFilter,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    dateLabel,
    filteredTransactions,
  };
}
