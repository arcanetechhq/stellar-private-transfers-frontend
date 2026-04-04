import React from "react";
import { useParams } from "react-router";
import { DetailHeader } from "./detail-header";
import { DetailInfo } from "./detail-info";
import { DisclosureSection } from "./disclosure-section";
import { TransferConfirmation } from "./transfer-confirmation";
import { ActivityHistory } from "./activity-history";
import { useTransactionDetailsData } from "../model/use-transaction-details-data";

export function TransactionDetails() {
  const { id } = useParams();
  const details = useTransactionDetailsData(id);

  return (
    <div className="p-6">
      <div className="mx-auto max-w-6xl">
        <DetailHeader transactionId={id} />

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <DetailInfo
              storedTransaction={details.storedTransaction}
              hasPrivateRecord={details.hasPrivateRecord}
              chainMatchedAsset={details.chainMatchedAsset}
              chainTransferAmountRaw={details.chainTransferAmountRaw}
              chainCreatedAtSeconds={details.chainCreatedAtSeconds}
              chainEntry={details.chainEntry}
            />
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
