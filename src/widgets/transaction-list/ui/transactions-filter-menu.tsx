import type {
  TransactionAssetFilter,
  TransactionStatusFilter,
  TransactionTypeFilter,
} from "../model/transactions-panel-filters";

type FilterGroupProperties = {
  label: string;
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
};

function FilterGroup({
  label,
  options,
  value,
  onChange,
}: FilterGroupProperties) {
  return (
    <div className="transactions-filter-menu__group">
      <span className="transactions-filter-menu__label">{label}</span>
      <div className="transactions-filter-menu__options">
        {options.map((option) => (
          <button
            type="button"
            key={option.value}
            className="transactions-filter-menu__option"
            data-active={option.value === value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

type TransactionsFilterMenuProperties = {
  open: boolean;
  typeFilter: TransactionTypeFilter;
  assetFilter: TransactionAssetFilter;
  statusFilter: TransactionStatusFilter;
  assetOptions: string[];
  labels: {
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
  onTypeFilterChange: (value: TransactionTypeFilter) => void;
  onAssetFilterChange: (value: TransactionAssetFilter) => void;
  onStatusFilterChange: (value: TransactionStatusFilter) => void;
  onClearFilters: () => void;
};

export function TransactionsFilterMenu({
  open,
  typeFilter,
  assetFilter,
  statusFilter,
  assetOptions,
  labels,
  onTypeFilterChange,
  onAssetFilterChange,
  onStatusFilterChange,
  onClearFilters,
}: TransactionsFilterMenuProperties) {
  if (!open) {
    return null;
  }

  const assetFilterOptions = [
    { value: "all", label: labels.all },
    ...assetOptions.map((assetId) => ({
      value: assetId,
      label: assetId.toUpperCase(),
    })),
  ];

  return (
    <div
      className="transactions-filter-menu"
      role="dialog"
      aria-label={labels.type}
    >
      <FilterGroup
        label={labels.type}
        options={[
          { value: "all", label: labels.all },
          { value: "incoming", label: labels.incoming },
          { value: "outgoing", label: labels.outgoing },
        ]}
        value={typeFilter}
        onChange={(value) => onTypeFilterChange(value as TransactionTypeFilter)}
      />
      <FilterGroup
        label={labels.asset}
        options={assetFilterOptions}
        value={assetFilter}
        onChange={(value) =>
          onAssetFilterChange(value as TransactionAssetFilter)
        }
      />
      <FilterGroup
        label={labels.status}
        options={[
          { value: "all", label: labels.all },
          { value: "completed", label: labels.completed },
          { value: "pending", label: labels.pending },
        ]}
        value={statusFilter}
        onChange={(value) =>
          onStatusFilterChange(value as TransactionStatusFilter)
        }
      />
      <button
        type="button"
        className="transactions-filter-menu__clear"
        onClick={onClearFilters}
      >
        {labels.clearFilters}
      </button>
    </div>
  );
}
