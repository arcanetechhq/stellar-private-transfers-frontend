import React from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import type { FilterType } from "../model/transaction-history";
import { FilterPillButton } from "./filter-pill-button";
import type { DateFilterDropdownProperties } from "./date-filter-dropdown";
import { DateFilterDropdown } from "./date-filter-dropdown";

const filterTypes: Array<{ value: FilterType; labelKey: string }> = [
  { value: "all", labelKey: "filterTypes.all" },
  { value: "deposits", labelKey: "filterTypes.deposits" },
  { value: "transfers", labelKey: "filterTypes.privateTransfers" },
  { value: "withdrawals", labelKey: "filterTypes.withdrawals" },
];

export interface HistoryFiltersProperties
  extends DateFilterDropdownProperties {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  filterType: FilterType;
  setFilterType: (value: FilterType) => void;
}

export function HistoryFilters(properties: HistoryFiltersProperties) {
  const { t: translate } = useTranslation("history");
  const {
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    ...dateFilterProperties
  } = properties;

  return (
    <div
      className="rounded-xl bg-white p-5"
      style={{ border: "1px solid #E7EAF0", marginBottom: "24px" }}
    >
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2"
            style={{ color: "#98A2B3" }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={translate("searchPlaceholder")}
            className="w-full rounded-lg py-2.5 pr-4 pl-11 focus:ring-2 focus:outline-none"
            style={{
              fontSize: "14px",
              lineHeight: "20px",
              border: "1px solid #E7EAF0",
              color: "#121826",
            }}
          />
        </div>

        <div className="flex gap-2">
          {filterTypes.map((filter) => (
            <FilterPillButton
              key={filter.value}
              label={translate(filter.labelKey)}
              isActive={filterType === filter.value}
              onClick={() => setFilterType(filter.value)}
            />
          ))}
        </div>

        <DateFilterDropdown {...dateFilterProperties} />
      </div>
    </div>
  );
}
