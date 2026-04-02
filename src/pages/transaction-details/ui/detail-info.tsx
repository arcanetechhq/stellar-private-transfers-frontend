import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardHeader, CardContent } from "@/shared/ui/surface-card";
import { StatusBadge } from "@/shared/ui/status-badge";
import { TokenIcon } from "@/shared/ui/token-icon";
import { useAssetLookup, type AssetDto } from "@/entities/asset";
import type { Transaction } from "@/entities/transaction";
import { getStatusVariant } from "@/widgets/transaction-list";

interface DetailInfoProperties {
  transaction: Transaction | undefined;
}

interface ResolvedAsset {
  asset: AssetDto | undefined;
  assetLabel: string;
  ticker: string;
}

function resolveAsset(
  transaction: Transaction | undefined,
  assetMap: Map<string, AssetDto>,
): ResolvedAsset {
  const asset = transaction ? assetMap.get(transaction.assetId) : undefined;
  const assetLabel = asset?.name ?? transaction?.assetId ?? "—";
  const ticker = transaction?.assetId.toUpperCase() ?? "";
  return { asset, assetLabel, ticker };
}

export function DetailInfo(properties: DetailInfoProperties) {
  const { transaction } = properties;
  const { t: translate } = useTranslation("transactionDetails");
  const assetMap = useAssetLookup();
  const { asset, assetLabel, ticker } = resolveAsset(transaction, assetMap);

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-gray-900">
          {translate("transactionInformation")}
        </h2>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="mb-1 text-sm text-gray-500">
              {translate("amount")}
            </div>
            <div className="text-2xl font-semibold text-gray-900">
              {transaction
                ? `${transaction.amount.toLocaleString()} ${transaction.assetId.toUpperCase()}`
                : "—"}
            </div>
          </div>
          <div>
            <div className="mb-1 text-sm text-gray-500">
              {translate("asset")}
            </div>
            <div className="flex items-center gap-2">
              <TokenIcon
                ticker={ticker}
                logoUrl={asset?.logoUrl}
                size="lg"
              />
              <div className="text-2xl font-semibold text-gray-900">
                {assetLabel}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3 border-t border-gray-200 pt-4">
          <div className="flex justify-between">
            <span className="text-gray-600">
              {translate("transactionStatus")}
            </span>
            {transaction ? (
              <StatusBadge variant={getStatusVariant(transaction.status)}>
                {transaction.status}
              </StatusBadge>
            ) : (
              <span>—</span>
            )}
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{translate("sender")}</span>
            <span className="font-mono text-sm font-medium text-gray-900">
              {transaction?.counterparty || "—"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{translate("dateTime")}</span>
            <span className="font-medium text-gray-900">
              {transaction
                ? new Date(transaction.date).toLocaleString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "—"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
