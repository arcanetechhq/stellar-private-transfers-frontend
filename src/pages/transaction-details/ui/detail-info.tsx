import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardHeader, CardContent } from "@/shared/ui/surface-card";
import { useAssetLookup, type AssetDto } from "@/entities/asset";
import type { ChainDetailsEntry, Transaction } from "@/entities/transaction";
import {
  resolveChainDetailAssetDisplay,
  resolveDetailAmountContent,
  resolveDetailChainHint,
  resolveDetailDateTimeRowContent,
  resolveStoredDetailAsset,
} from "../lib/detail-info-resolvers";
import {
  DetailInfoAmountAssetGrid,
  DetailInfoChainBanner,
  DetailInfoMetaRows,
} from "./detail-info-sections";

interface DetailInfoProperties {
  storedTransaction: Transaction | undefined;
  hasPrivateRecord: boolean;
  chainMatchedAsset: AssetDto | undefined;
  chainTransferAmountRaw: string | undefined;
  chainCreatedAtSeconds: number | undefined;
  chainEntry: ChainDetailsEntry | undefined;
}

export function DetailInfo(properties: DetailInfoProperties) {
  const {
    storedTransaction,
    hasPrivateRecord,
    chainMatchedAsset,
    chainTransferAmountRaw,
    chainCreatedAtSeconds,
    chainEntry,
  } = properties;
  const { t: translate } = useTranslation("transactionDetails");
  const assetMap = useAssetLookup();
  const storedResolved = resolveStoredDetailAsset(storedTransaction, assetMap);
  const chainResolved = resolveChainDetailAssetDisplay(chainMatchedAsset);
  const displayAsset = hasPrivateRecord ? storedResolved : chainResolved;
  const amountContent = resolveDetailAmountContent({
    hasPrivateRecord,
    storedTransaction,
    chainTransferAmountRaw,
    chainMatchedAsset,
    translate,
  });
  const chainHint = resolveDetailChainHint(chainEntry, translate);
  const dateTimeDisplay = resolveDetailDateTimeRowContent({
    chainCreatedAtSeconds,
    chainEntry,
    translate,
  });

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-[var(--foreground-primary)]">
          {translate("transactionInformation")}
        </h2>
      </CardHeader>
      <CardContent className="space-y-4">
        {chainHint && <DetailInfoChainBanner chainHint={chainHint} />}
        <DetailInfoAmountAssetGrid
          amountContent={amountContent}
          displayAsset={displayAsset}
          amountLabel={translate("amount")}
          assetLabel={translate("asset")}
        />
        <DetailInfoMetaRows
          hasPrivateRecord={hasPrivateRecord}
          storedTransaction={storedTransaction}
          dateTimeDisplay={dateTimeDisplay}
          transactionStatusLabel={translate("transactionStatus")}
          completedStatusLabel={translate("completed")}
          senderLabel={translate("sender")}
          recipientLabel={translate("recipient")}
          dateTimeLabel={translate("dateTime")}
          privateLabel={translate("privateLabel")}
        />
      </CardContent>
    </Card>
  );
}
