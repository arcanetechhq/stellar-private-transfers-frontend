import React from "react";
import { useParams } from "react-router";
import { DetailHeader } from "./detail-header";
import { DetailInfo } from "./detail-info";
import { DisclosureSection } from "./disclosure-section";
import { TransferConfirmation } from "./transfer-confirmation";
import { ActivityHistory } from "./activity-history";

export function TransactionDetails() {
  const { id } = useParams();

  return (
    <div className="p-6">
      <div className="mx-auto max-w-6xl">
        <DetailHeader transactionId={id} />

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <DetailInfo />
            <DisclosureSection />
          </div>

          <div className="space-y-6">
            <TransferConfirmation />
            <ActivityHistory />
          </div>
        </div>
      </div>
    </div>
  );
}
