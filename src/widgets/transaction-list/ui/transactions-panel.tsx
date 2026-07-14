import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./transactions-panel.css";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { ChevronDown } from "lucide-react";
import { useAppSelector } from "@/store";
import type { Transaction } from "@/entities/transaction";
import { selectIsWalletConnected } from "@/entities/wallet";
import { TransactionsExportModal } from "@/features/export-transactions";
import { resolveTransactionActivityTitle } from "../lib/transaction-display";
import {
  collectTransactionAssetIds,
  countActiveFilters,
  filterTransactions,
  findTransactionPage,
  getTransactionsPageCount,
  paginateTransactions,
  TRANSACTIONS_PANEL_PAGE_SIZE,
  type TransactionPanelFilterState,
  type TransactionSortKey,
} from "../model/transactions-panel-filters";
import { computeTransactionStats } from "../lib/compute-transaction-stats";
import { buildTransactionsPathWithSelection } from "../lib/transactions-selection-path";
import { OverviewTransactionsHeader } from "./overview-transactions-header";
import { PageTransactionsHeader } from "./page-transactions-header";
import { TransactionStats } from "./transaction-stats";
import { TransactionsPanelPagination } from "./transactions-panel-pagination";
import {
  buildTransactionTableColumns,
  TransactionsDataTable,
} from "./transactions-data-table";
import { TransactionsPanelEmptyState } from "./transactions-panel-empty-state";

type TransactionsPanelVariant = "overview" | "page";

type TransactionsPanelProperties = {
  transactions: Transaction[];
  isHydrated: boolean;
  variant: TransactionsPanelVariant;
  selectedTransactionId?: string;
  onTransactionSelect?: (transactionId: string) => void;
};

const defaultFilters: TransactionPanelFilterState = {
  search: "",
  period: "last3Months",
  typeFilter: "all",
  assetFilter: "all",
  statusFilter: "all",
  sort: { key: "date", direction: "desc" },
};

function TransactionsSortHeader({
  columnKey,
  label,
  sort,
  onSort,
}: {
  columnKey: TransactionSortKey;
  label: string;
  sort: TransactionPanelFilterState["sort"];
  onSort: (key: TransactionSortKey) => void;
}) {
  const active = sort.key === columnKey;

  return (
    <button
      type="button"
      className="transactions-sort-button"
      data-active={active}
      data-direction={active ? sort.direction : undefined}
      onClick={(event) => {
        event.stopPropagation();
        onSort(columnKey);
      }}
    >
      <span>{label}</span>
      <ChevronDown aria-hidden="true" />
    </button>
  );
}

export function TransactionsPanel({
  transactions,
  isHydrated,
  variant,
  selectedTransactionId,
  onTransactionSelect,
}: TransactionsPanelProperties) {
  const { t: translate } = useTranslation("transactions");
  const navigate = useNavigate();
  const isWalletConnected = useAppSelector(selectIsWalletConnected);
  const [filters, setFilters] =
    useState<TransactionPanelFilterState>(defaultFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const periodOptions = useMemo(
    () => [
      { value: "last30Days" as const, label: translate("periods.last30Days") },
      {
        value: "last3Months" as const,
        label: translate("periods.last3Months"),
      },
      { value: "thisYear" as const, label: translate("periods.thisYear") },
    ],
    [translate],
  );

  const filterLabels = useMemo(
    () => ({
      type: translate("filterGroups.type"),
      asset: translate("filterGroups.asset"),
      status: translate("filterGroups.status"),
      all: translate("filterOptions.all"),
      incoming: translate("filterOptions.incoming"),
      outgoing: translate("filterOptions.outgoing"),
      completed: translate("filterOptions.completed"),
      pending: translate("filterOptions.pending"),
      clearFilters: translate("clearFilters"),
    }),
    [translate],
  );

  const assetOptions = useMemo(
    () => collectTransactionAssetIds(transactions),
    [transactions],
  );

  const filteredTransactions = useMemo(
    () => filterTransactions({ transactions, filters }),
    [filters, transactions],
  );
  const filteredTransactionsReference = useRef(filteredTransactions);
  filteredTransactionsReference.current = filteredTransactions;

  const totalPages = getTransactionsPageCount(
    filteredTransactions.length,
    TRANSACTIONS_PANEL_PAGE_SIZE,
  );

  const showPagination =
    filteredTransactions.length > TRANSACTIONS_PANEL_PAGE_SIZE;

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  useEffect(() => {
    if (variant !== "page" || !selectedTransactionId) {
      return;
    }
    const pageForSelection = findTransactionPage(
      filteredTransactionsReference.current,
      selectedTransactionId,
      TRANSACTIONS_PANEL_PAGE_SIZE,
    );
    if (pageForSelection !== null) {
      setCurrentPage((current) =>
        current === pageForSelection ? current : pageForSelection,
      );
    }
  }, [selectedTransactionId, variant]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const visibleTransactions = useMemo(
    () =>
      paginateTransactions(
        filteredTransactions,
        currentPage,
        TRANSACTIONS_PANEL_PAGE_SIZE,
      ),
    [currentPage, filteredTransactions],
  );

  const transactionStats = useMemo(
    () => computeTransactionStats({ transactions, filters }),
    [filters, transactions],
  );

  const activeFilterCount = countActiveFilters(filters);
  const emptyKind = !isWalletConnected
    ? "disconnected"
    : !isHydrated
      ? "loading"
      : transactions.length === 0
        ? "empty"
        : "filtered";

  const getLabel = useCallback(
    (transaction: Transaction) =>
      resolveTransactionActivityTitle(transaction, (key) => translate(key)),
    [translate],
  );

  const handleSort = useCallback((key: TransactionSortKey) => {
    setFilters((current) => ({
      ...current,
      sort: {
        key,
        direction:
          current.sort.key === key && current.sort.direction === "desc"
            ? "asc"
            : "desc",
      },
    }));
  }, []);

  const columns = useMemo(() => {
    return buildTransactionTableColumns({
      dateTitle: (
        <TransactionsSortHeader
          columnKey="date"
          label={translate("tableHeaders.date")}
          sort={filters.sort}
          onSort={handleSort}
        />
      ),
      activityTitle: translate("tableHeaders.activity"),
      amountTitle: (
        <TransactionsSortHeader
          columnKey="amount"
          label={translate("tableHeaders.amount")}
          sort={filters.sort}
          onSort={handleSort}
        />
      ),
      getTransactionLabel: getLabel,
    });
  }, [filters.sort, getLabel, handleSort, translate]);

  function clearFilters() {
    setFilters(defaultFilters);
  }

  function handleRefresh() {
    setRefreshing(true);
    window.setTimeout(() => setRefreshing(false), 650);
  }

  const handleRowClick = useCallback(
    (transaction: Transaction) => {
      if (variant === "page" && onTransactionSelect) {
        onTransactionSelect(transaction.id);
        return;
      }
      navigate(buildTransactionsPathWithSelection(transaction.id));
    },
    [navigate, onTransactionSelect, variant],
  );

  return (
    <section
      className={`transactions-panel ui-card transactions-panel--${variant}`}
    >
      {variant === "overview" ? (
        <OverviewTransactionsHeader
          title={translate("title")}
          viewAllLabel={translate("viewAll")}
          searchPlaceholder={translate("searchPlaceholder")}
          search={filters.search}
          period={filters.period}
          periodOptions={periodOptions}
          onSearchChange={(search) =>
            setFilters((current) => ({ ...current, search }))
          }
          onPeriodChange={(period) =>
            setFilters((current) => ({ ...current, period }))
          }
        />
      ) : (
        <div className="transactions-panel__page-top">
          <TransactionStats
            stats={transactionStats}
            resolveLabel={(stat) => translate(`stats.${stat.id}`)}
            // resolvePendingMeta={(count) =>
            //   translate("stats.pendingMeta", { count })
            // }
          />
          <PageTransactionsHeader
            searchPlaceholder={translate("searchPlaceholder")}
            search={filters.search}
            period={filters.period}
            periodOptions={periodOptions}
            typeFilter={filters.typeFilter}
            assetFilter={filters.assetFilter}
            statusFilter={filters.statusFilter}
            assetOptions={assetOptions}
            activeFilterCount={activeFilterCount}
            filtersOpen={filtersOpen}
            showFilterBar={false}
            refreshing={refreshing}
            exportLabel={translate("exportData")}
            refreshLabel={translate("refresh")}
            filterLabel={translate("filter")}
            filterLabels={filterLabels}
            onSearchChange={(search) =>
              setFilters((current) => ({ ...current, search }))
            }
            onPeriodChange={(period) =>
              setFilters((current) => ({ ...current, period }))
            }
            onTypeFilterChange={(typeFilter) =>
              setFilters((current) => ({ ...current, typeFilter }))
            }
            onAssetFilterChange={(assetFilter) =>
              setFilters((current) => ({ ...current, assetFilter }))
            }
            onStatusFilterChange={(statusFilter) =>
              setFilters((current) => ({ ...current, statusFilter }))
            }
            onFiltersOpenChange={setFiltersOpen}
            onClearFilters={clearFilters}
            onRefresh={handleRefresh}
            onExport={() => setExportOpen(true)}
          />
          <TransactionsExportModal
            open={exportOpen}
            onOpenChange={setExportOpen}
            exportContext={{
              filters: { type: filters.typeFilter },
            }}
          />
        </div>
      )}
      <div className="transactions-panel__table">
        {visibleTransactions.length > 0 ? (
          <TransactionsDataTable
            columns={columns}
            rows={visibleTransactions}
            rowKey={(transaction) => transaction.id}
            selectedKey={selectedTransactionId}
            onRowClick={handleRowClick}
          />
        ) : (
          <TransactionsPanelEmptyState
            kind={emptyKind}
            onClearFilters={
              emptyKind === "filtered" ? clearFilters : undefined
            }
          />
        )}
      </div>
      {showPagination ? (
        <TransactionsPanelPagination
          navLabel={translate("pagination.navLabel")}
          currentPage={currentPage}
          totalPages={totalPages}
          previousLabel={translate("pagination.previous")}
          nextLabel={translate("pagination.next")}
          onPageChange={setCurrentPage}
        />
      ) : null}
    </section>
  );
}
