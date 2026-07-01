import { useEffect, useRef, useState } from "react";
import {
  FileDown,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";
import { HIDDEN_FEATURES } from "@/shared/config/hidden-features";
import type {
  TransactionAssetFilter,
  TransactionPeriod,
  TransactionStatusFilter,
  TransactionTypeFilter,
} from "../model/transactions-panel-filters";
import { TransactionsFilterMenu } from "./transactions-filter-menu";
import {
  TransactionsPeriodSelect,
  TransactionsSearchField,
} from "./transactions-search-controls";

type PageTransactionsHeaderProperties = {
  searchPlaceholder: string;
  search: string;
  period: TransactionPeriod;
  periodOptions: Array<{ value: TransactionPeriod; label: string }>;
  typeFilter: TransactionTypeFilter;
  assetFilter: TransactionAssetFilter;
  statusFilter: TransactionStatusFilter;
  assetOptions: string[];
  activeFilterCount: number;
  filtersOpen: boolean;
  showFilterBar: boolean;
  refreshing: boolean;
  exportLabel: string;
  refreshLabel: string;
  filterLabel: string;
  filterLabels: {
    type: string;
    asset: string;
    status: string;
    all: string;
    incoming: string;
    outgoing: string;
    completed: string;
    pending: string;
    clearFilters: string;
  };
  onSearchChange: (value: string) => void;
  onPeriodChange: (value: TransactionPeriod) => void;
  onTypeFilterChange: (value: TransactionTypeFilter) => void;
  onAssetFilterChange: (value: TransactionAssetFilter) => void;
  onStatusFilterChange: (value: TransactionStatusFilter) => void;
  onFiltersOpenChange: (open: boolean) => void;
  onClearFilters: () => void;
  onRefresh: () => void;
  onExport: () => void;
};

export function PageTransactionsHeader({
  searchPlaceholder,
  search,
  period,
  periodOptions,
  typeFilter,
  assetFilter,
  statusFilter,
  assetOptions,
  activeFilterCount,
  filtersOpen,
  showFilterBar,
  refreshing,
  exportLabel,
  refreshLabel,
  filterLabel,
  filterLabels,
  onSearchChange,
  onPeriodChange,
  onTypeFilterChange,
  onAssetFilterChange,
  onStatusFilterChange,
  onFiltersOpenChange,
  onClearFilters,
  onRefresh,
  onExport,
}: PageTransactionsHeaderProperties) {
  const [inlineFiltersOpen, setInlineFiltersOpen] = useState(false);
  const filterReference = useRef<HTMLSpanElement>(null);
  const filterOpen = showFilterBar ? inlineFiltersOpen : filtersOpen;
  const setFilterOpen = showFilterBar ? setInlineFiltersOpen : onFiltersOpenChange;

  useEffect(() => {
    if (!filterOpen) {
      return undefined;
    }

    function handlePointerDown(event: MouseEvent) {
      if (
        filterReference.current &&
        !filterReference.current.contains(event.target as Node)
      ) {
        setFilterOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setFilterOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [filterOpen, setFilterOpen]);

  return (
    <>
      <div className="transactions-panel__header transactions-panel__header--page">
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
        <div className="transactions-panel__actions">
          {showFilterBar ? (
            <span className="transactions-panel__filter" ref={filterReference}>
              <button
                type="button"
                className="transactions-panel__icon-button"
                data-active={filterOpen}
                aria-label={filterLabel}
                onClick={() => setFilterOpen(!filterOpen)}
              >
                <SlidersHorizontal />
              </button>
              {activeFilterCount > 0 ? (
                <span className="transactions-panel__filter-count">
                  {activeFilterCount}
                </span>
              ) : null}
              <TransactionsFilterMenu
                open={filterOpen}
                typeFilter={typeFilter}
                assetFilter={assetFilter}
                statusFilter={statusFilter}
                assetOptions={assetOptions}
                labels={filterLabels}
                onTypeFilterChange={onTypeFilterChange}
                onAssetFilterChange={onAssetFilterChange}
                onStatusFilterChange={onStatusFilterChange}
                onClearFilters={onClearFilters}
              />
            </span>
          ) : null}
          {!HIDDEN_FEATURES.transactionsRefreshButton ? (
            <button
              type="button"
              className="transactions-panel__icon-button transactions-refresh-button"
              data-active={refreshing}
              aria-label={refreshLabel}
              onClick={onRefresh}
            >
              <RefreshCw />
            </button>
          ) : null}
          {!HIDDEN_FEATURES.transactionsExportButton ? (
            <button
              type="button"
              className="transactions-panel__export-button"
              onClick={onExport}
            >
              <FileDown aria-hidden="true" size={20} />
              <span>{exportLabel}</span>
            </button>
          ) : null}
        </div>
      </div>
    </>
  );
}
