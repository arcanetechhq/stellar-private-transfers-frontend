import React from "react";
import { useParams } from "react-router";
import { DetailHeader } from "./detail-header";
import { DetailInfo } from "./detail-info";
import { useTransactionDetailsData } from "../model/use-transaction-details-data";

export function TransactionDetails() {
  const { id } = useParams();
  const details = useTransactionDetailsData(id);

  return (
    <div className="min-h-full bg-[var(--background)] p-8">
      <div className="mx-auto max-w-6xl">
        <DetailHeader transactionId={id} />

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-3 space-y-6">
            <DetailInfo
              storedTransaction={details.storedTransaction}
              hasPrivateRecord={details.hasPrivateRecord}
              chainMatchedAsset={details.chainMatchedAsset}
              chainTransferAmountRaw={details.chainTransferAmountRaw}
              chainCreatedAtSeconds={details.chainCreatedAtSeconds}
              chainEntry={details.chainEntry}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
