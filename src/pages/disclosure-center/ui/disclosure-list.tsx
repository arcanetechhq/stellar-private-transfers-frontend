import React from "react";
import { Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardHeader, CardContent } from "@/shared/ui/surface-card";
import { StatusBadge } from "@/shared/ui/status-badge";
import {
  type DisclosureFilter,
  type DisclosureRequest,
  DISCLOSURE_STATUS_VARIANT,
  DISCLOSURE_STATUS_LABEL_KEYS,
  FILTER_OPTION_VALUES,
  FILTER_OPTION_KEYS,
  mockDisclosureRequests,
} from "../model/disclosure-center";

interface FilterBarProperties {
  filter: DisclosureFilter;
  onFilterChange: (filter: DisclosureFilter) => void;
}

function FilterBar(properties: FilterBarProperties) {
  const { filter, onFilterChange } = properties;
  const { t: translate } = useTranslation("disclosure");

  return (
    <div className="flex gap-2">
      {FILTER_OPTION_VALUES.map((value) => (
        <button
          key={value}
          onClick={() => onFilterChange(value)}
          className={`rounded-lg px-4 py-2 text-sm transition-colors ${
            filter === value
              ? "bg-blue-600 text-white"
              : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          {translate(FILTER_OPTION_KEYS[value])}
        </button>
      ))}
    </div>
  );
}

interface RequestItemProperties {
  request: DisclosureRequest;
  isSelected: boolean;
  onSelect: (request: DisclosureRequest) => void;
}

function RequestItem(properties: RequestItemProperties) {
  const { request, isSelected, onSelect } = properties;
  const { t: translate } = useTranslation("disclosure");
  const requestTypeLabel =
    request.requestType === "partial"
      ? translate("partialDisclosure")
      : translate("fullDisclosure");
  return (
    <button
      onClick={() => onSelect(request)}
      className={`w-full px-6 py-4 text-left transition-colors hover:bg-gray-50 ${
        isSelected ? "bg-blue-50" : ""
      }`}
    >
      <div className="mb-2 flex items-start justify-between">
        <div>
          <div className="font-medium text-gray-900">{request.requestor}</div>
          <div className="mt-1 text-sm text-gray-500">
            {translate("transactionIdPrefix")}: {request.transactionId}
          </div>
        </div>
        <StatusBadge variant={DISCLOSURE_STATUS_VARIANT[request.status]}>
          {translate(DISCLOSURE_STATUS_LABEL_KEYS[request.status])}
        </StatusBadge>
      </div>
      <div className="flex items-center gap-4 text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          {new Date(request.requestDate).toLocaleDateString("en-US")}
        </span>
        <span className="capitalize">{requestTypeLabel}</span>
      </div>
    </button>
  );
}

interface RequestListCardProperties {
  requests: DisclosureRequest[];
  selectedRequestId: string | undefined;
  onSelectRequest: (request: DisclosureRequest) => void;
}

function RequestListCard(properties: RequestListCardProperties) {
  const { requests, selectedRequestId, onSelectRequest } = properties;
  const { t: translate } = useTranslation("disclosure");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {translate("disclosureRequests")}
          </h2>
          <StatusBadge variant="pending">
            {translate("requestsCount", { count: requests.length })}
          </StatusBadge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-100">
          {requests.map((request) => (
            <RequestItem
              key={request.id}
              request={request}
              isSelected={selectedRequestId === request.id}
              onSelect={onSelectRequest}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface DisclosedTransactionRowProperties {
  request: DisclosureRequest;
}

function DisclosedTransactionRow(properties: DisclosedTransactionRowProperties) {
  const { request } = properties;
  const { t: translate } = useTranslation("disclosure");
  const expiryDisplay = request.expiry
    ? new Date(request.expiry).toLocaleDateString("en-US")
    : translate("indefinite");
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 font-mono text-sm text-gray-900">
        {request.transactionId}
      </td>
      <td className="px-6 py-4 text-sm text-gray-900">
        {request.requestor}
      </td>
      <td className="px-6 py-4 text-sm">
        <StatusBadge variant="info">
          {request.requestType === "partial" ? translate("partial") : translate("full")}
        </StatusBadge>
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">
        {new Date(request.requestDate).toLocaleDateString("en-US")}
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">{expiryDisplay}</td>
    </tr>
  );
}

function DisclosedTransactionsTable() {
  const { t: translate } = useTranslation("disclosure");
  const approvedRequests = mockDisclosureRequests.filter(
    (request) => request.status === "approved",
  );
  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-gray-900">
          {translate("alreadyDisclosed")}
        </h2>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  {translate("transactionId")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  {translate("disclosedTo")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  {translate("disclosureType")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  {translate("date")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  {translate("accessExpiry")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {approvedRequests.map((request) => (
                <DisclosedTransactionRow
                  key={request.id}
                  request={request}
                />
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export interface DisclosureListProperties {
  filter: DisclosureFilter;
  onFilterChange: (filter: DisclosureFilter) => void;
  filteredRequests: DisclosureRequest[];
  selectedRequestId: string | undefined;
  onSelectRequest: (request: DisclosureRequest) => void;
}

export function DisclosureList(properties: DisclosureListProperties) {
  const {
    filter,
    onFilterChange,
    filteredRequests,
    selectedRequestId,
    onSelectRequest,
  } = properties;
  return (
    <div className="col-span-2 space-y-6">
      <FilterBar filter={filter} onFilterChange={onFilterChange} />
      <RequestListCard
        requests={filteredRequests}
        selectedRequestId={selectedRequestId}
        onSelectRequest={onSelectRequest}
      />
      <DisclosedTransactionsTable />
    </div>
  );
}
