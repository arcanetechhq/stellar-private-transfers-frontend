import React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  type DisclosureFilter,
  mockDisclosureRequests,
} from "../model/disclosure-center";
import { DisclosureList } from "./disclosure-list";
import { DisclosureDetail } from "./disclosure-detail";

export function DisclosureCenter() {
  const { t: translate } = useTranslation("disclosure");
  const [filter, setFilter] = useState<DisclosureFilter>("all");
  const [selectedRequest, setSelectedRequest] = useState(
    mockDisclosureRequests[0],
  );

  const filteredRequests = mockDisclosureRequests.filter(
    (request) => filter === "all" || request.status === filter,
  );

  return (
    <div className="p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-gray-600">
            {translate("pageSubtitle")}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <DisclosureList
            filter={filter}
            onFilterChange={setFilter}
            filteredRequests={filteredRequests}
            selectedRequestId={selectedRequest?.id}
            onSelectRequest={setSelectedRequest}
          />
          <DisclosureDetail selectedRequest={selectedRequest} />
        </div>
      </div>
    </div>
  );
}
