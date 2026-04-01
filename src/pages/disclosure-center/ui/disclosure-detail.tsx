import React from "react";
import { Eye, CheckCircle2, XCircle, Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardHeader, CardContent } from "@/shared/ui/surface-card";
import { StatusBadge } from "@/shared/ui/status-badge";
import {
  type DisclosureRequest,
  DISCLOSURE_STATUS_VARIANT,
} from "../model/disclosure-center";

interface RequestDetailsCardProperties {
  request: DisclosureRequest;
}

function RequestDetailsCard(properties: RequestDetailsCardProperties) {
  const { request } = properties;
  const { t: translate } = useTranslation("disclosure");
  const statusLabel =
    request.status === "pending"
      ? translate("awaitingDecision")
      : translate(`statusLabels.${request.status}`);
  const requestTypeLabel =
    request.requestType === "partial"
      ? translate("partialDisclosure")
      : translate("fullDisclosure");
  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-gray-900">
          {translate("requestDetails")}
        </h2>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="mb-1 text-sm text-gray-500">{translate("requestingParty")}</div>
          <div className="font-medium text-gray-900">{request.requestor}</div>
        </div>
        <div>
          <div className="mb-1 text-sm text-gray-500">{translate("transactionId")}</div>
          <div className="font-mono text-sm font-medium text-gray-900">
            {request.transactionId}
          </div>
        </div>
        <div>
          <div className="mb-1 text-sm text-gray-500">{translate("requestType")}</div>
          <StatusBadge variant="info">{requestTypeLabel}</StatusBadge>
        </div>
        <div>
          <div className="mb-1 text-sm text-gray-500">{translate("requestDate")}</div>
          <div className="text-gray-900">
            {new Date(request.requestDate).toLocaleString("en-US")}
          </div>
        </div>
        <div>
          <div className="mb-1 text-sm text-gray-500">{translate("status")}</div>
          <StatusBadge variant={DISCLOSURE_STATUS_VARIANT[request.status]}>
            {statusLabel}
          </StatusBadge>
        </div>
      </CardContent>
    </Card>
  );
}

function RequestActionsCard() {
  const { t: translate } = useTranslation("disclosure");

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-gray-900">{translate("actions")}</h2>
      </CardHeader>
      <CardContent className="space-y-3">
        <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700">
          <CheckCircle2 className="h-4 w-4" />
          {translate("approveLimited")}
        </button>
        <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
          <Eye className="h-4 w-4" />
          {translate("approveFull")}
        </button>
        <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50">
          <XCircle className="h-4 w-4" />
          {translate("rejectRequest")}
        </button>
        <div className="border-t border-gray-200 pt-4">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            {translate("setAccessExpiry")}
          </label>
          <div className="relative">
            <input
              type="date"
              className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <Calendar className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            {translate("leaveBlankHint")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export interface DisclosureDetailProperties {
  selectedRequest: DisclosureRequest | undefined;
}

export function DisclosureDetail(properties: DisclosureDetailProperties) {
  const { selectedRequest } = properties;
  if (!selectedRequest) {
    return;
  }
  return (
    <div className="space-y-6">
      <RequestDetailsCard request={selectedRequest} />
      {selectedRequest.status === "pending" && <RequestActionsCard />}
    </div>
  );
}
