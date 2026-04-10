import React from "react";
import { useParams } from "react-router";
import { DetailHeader } from "./detail-header";
import { DetailInfo } from "./detail-info";
import { useTransactionDetailsData } from "../model/use-transaction-details-data";

export function TransactionDetails() {
  const { id } = useParams();
  const details = useTransactionDetailsData(id);

  return (
    <div className="min-h-full bg-[var(--background)] p-6">
      <div className="mx-auto max-w-7xl">
        <DetailHeader transactionId={id} />

        <div>
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
  );
}
