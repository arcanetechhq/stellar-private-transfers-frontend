import React from "react";
import { useTranslation } from "react-i18next";
import { Calendar, ChevronDown } from "lucide-react";
import type { DateFilterValue } from "../model/transaction-history";
import {
  dateFilterOptions,
  mockActiveFontWeight,
  mockInactiveFontWeight,
} from "../model/transaction-history";

interface DateFilterOptionProperties {
  option: { value: DateFilterValue; label: string };
  isSelected: boolean;
  onSelect: (value: DateFilterValue) => void;
}

function DateFilterOption(properties: DateFilterOptionProperties) {
  const { t: translate } = useTranslation("history");
  const { option, isSelected, onSelect } = properties;

  return (
    <button
      className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors"
      style={{
        fontSize: "14px",
        lineHeight: "20px",
        color: isSelected ? "#111827" : "#667085",
        backgroundColor: isSelected ? "#F9FAFB" : "transparent",
        fontWeight: isSelected ? mockActiveFontWeight : mockInactiveFontWeight,
      }}
      onClick={() => onSelect(option.value)}
      onMouseEnter={(event) => {
        if (!isSelected)
          event.currentTarget.style.backgroundColor = "#F9FAFB";
      }}
      onMouseLeave={(event) => {
        if (!isSelected)
          event.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      <span>{translate(option.label)}</span>
      {isSelected && (
        <div
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: "#10B981" }}
        />
      )}
    </button>
  );
}

interface CustomDateRangeProperties {
  customStartDate: string;
  setCustomStartDate: (value: string) => void;
  customEndDate: string;
  setCustomEndDate: (value: string) => void;
  onApply: () => void;
}

const labelStyle = {
  fontSize: "12px",
  lineHeight: "16px",
  color: "#667085",
  fontWeight: 500,
};

const inputStyle = {
  fontSize: "14px",
  lineHeight: "20px",
  border: "1px solid #E7EAF0",
  color: "#121826",
};

function CustomDateRange(properties: CustomDateRangeProperties) {
  const { t: translate } = useTranslation("history");
  const {
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    onApply,
  } = properties;

  return (
    <>
      <div
        style={{
          height: "1px",
          backgroundColor: "#E7EAF0",
          margin: "8px 0",
        }}
      />
      <div className="p-4">
        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block" style={labelStyle}>
              {translate("startDate")}
            </label>
            <input
              type="date"
              value={customStartDate}
              onChange={(event) => setCustomStartDate(event.target.value)}
              className="w-full rounded-lg px-3 py-2 focus:ring-2 focus:outline-none"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="mb-1.5 block" style={labelStyle}>
              {translate("endDate")}
            </label>
            <input
              type="date"
              value={customEndDate}
              onChange={(event) => setCustomEndDate(event.target.value)}
              className="w-full rounded-lg px-3 py-2 focus:ring-2 focus:outline-none"
              style={inputStyle}
            />
          </div>
          <button
            onClick={onApply}
            className="w-full rounded-lg px-4 py-2.5 font-semibold transition-colors"
            style={{
              fontSize: "14px",
              lineHeight: "20px",
              backgroundColor: "#111827",
              color: "#FFFFFF",
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.backgroundColor = "#1F2937";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.backgroundColor = "#111827";
            }}
          >
            {translate("apply")}
          </button>
        </div>
      </div>
    </>
  );
}

export interface DateFilterDropdownProperties {
  dateFilter: DateFilterValue;
  setDateFilter: (value: DateFilterValue) => void;
  dateFilterOpen: boolean;
  setDateFilterOpen: (value: boolean) => void;
  customStartDate: string;
  setCustomStartDate: (value: string) => void;
  customEndDate: string;
  setCustomEndDate: (value: string) => void;
  dateLabel: string;
}

export function DateFilterDropdown(properties: DateFilterDropdownProperties) {
  const { t: translate } = useTranslation("history");
  const { dateFilter, setDateFilter, dateFilterOpen, setDateFilterOpen,
    customStartDate, setCustomStartDate, customEndDate, setCustomEndDate,
    dateLabel } = properties;

  const handleOptionSelect = (value: DateFilterValue) => {
    setDateFilter(value);
    if (value !== "custom") {
      setDateFilterOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        className="flex items-center gap-2 rounded-lg px-4 py-2.5 transition-colors"
        style={{
          fontSize: "14px",
          lineHeight: "20px",
          fontWeight: 600,
          backgroundColor: dateFilter === "all" ? "#FFFFFF" : "#111827",
          color: dateFilter === "all" ? "#667085" : "#FFFFFF",
          border: dateFilter === "all" ? "1px solid #E7EAF0" : "none",
        }}
        onMouseEnter={(event) => {
          if (dateFilter === "all")
            event.currentTarget.style.backgroundColor = "#F6F7F9";
        }}
        onMouseLeave={(event) => {
          if (dateFilter === "all")
            event.currentTarget.style.backgroundColor = "#FFFFFF";
        }}
        onClick={() => setDateFilterOpen(!dateFilterOpen)}
      >
        <Calendar className="h-4 w-4" />
        {translate(dateLabel)}
        <ChevronDown className="h-4 w-4" />
      </button>
      {dateFilterOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setDateFilterOpen(false)}
          />
          <div
            className="absolute right-0 z-20 mt-2 rounded-xl bg-white shadow-lg"
            style={{
              width: "280px",
              border: "1px solid #E7EAF0",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div className="p-2">
              {dateFilterOptions.map((option) => (
                <DateFilterOption
                  key={option.value}
                  option={option}
                  isSelected={dateFilter === option.value}
                  onSelect={handleOptionSelect}
                />
              ))}
            </div>
            {dateFilter === "custom" && (
              <CustomDateRange
                customStartDate={customStartDate}
                setCustomStartDate={setCustomStartDate}
                customEndDate={customEndDate}
                setCustomEndDate={setCustomEndDate}
                onApply={() => setDateFilterOpen(false)}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
