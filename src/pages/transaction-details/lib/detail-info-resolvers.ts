import type { TFunction } from "i18next";
import type { AssetDto } from "@/entities/asset";
import type { ChainDetailsEntry, Transaction } from "@/entities/transaction";
import {
  STELLAR_DEFAULT_ISSUED_ASSET_DECIMALS,
  formatRawAmountToDecimalString,
} from "@/shared/lib/stellar/format-stellar-raw-amount";
import { parseStellarRpcUnixTimestampSeconds } from "@/shared/lib/stellar/stellar-rpc-unix-timestamp";
import { formatDetailViewDateTimeFromUnixSeconds } from "./detail-info-datetime";

export interface ResolvedDetailAsset {
  asset: AssetDto | undefined;
  assetLabel: string;
  ticker: string;
}

export function resolveStoredDetailAsset(
  transaction: Transaction | undefined,
  assetMap: Map<string, AssetDto>,
): ResolvedDetailAsset {
  const asset = transaction ? assetMap.get(transaction.assetId) : undefined;
  const assetLabel = asset?.name ?? transaction?.assetId ?? "—";
  const ticker = transaction?.assetId.toUpperCase() ?? "";
  return { asset, assetLabel, ticker };
}

export function resolveChainDetailAssetDisplay(
  chainMatchedAsset: AssetDto | undefined,
): ResolvedDetailAsset {
  if (!chainMatchedAsset) {
    return { asset: undefined, assetLabel: "—", ticker: "" };
  }
  return {
    asset: chainMatchedAsset,
    assetLabel: chainMatchedAsset.name,
    ticker: chainMatchedAsset.assetId.toUpperCase(),
  };
}

export interface DetailAmountContentInput {
  hasPrivateRecord: boolean;
  storedTransaction: Transaction | undefined;
  chainTransferAmountRaw: string | undefined;
  chainMatchedAsset: AssetDto | undefined;
  translate: TFunction<"transactionDetails", undefined>;
}

export function resolveDetailAmountContent(
  input: DetailAmountContentInput,
): string {
  const {
    hasPrivateRecord,
    storedTransaction,
    chainTransferAmountRaw,
    chainMatchedAsset,
    translate,
  } = input;
  if (hasPrivateRecord && storedTransaction) {
    return `${storedTransaction.amount.toLocaleString()} ${storedTransaction.assetId.toUpperCase()}`;
  }
  if (!hasPrivateRecord && chainTransferAmountRaw) {
    if (chainMatchedAsset) {
      const decimals =
        chainMatchedAsset.decimals ?? STELLAR_DEFAULT_ISSUED_ASSET_DECIMALS;
      const formatted = formatRawAmountToDecimalString(
        chainTransferAmountRaw,
        decimals,
      );
      if (formatted !== undefined) {
        return `${formatted} ${chainMatchedAsset.assetId.toUpperCase()}`;
      }
    }
    return chainTransferAmountRaw;
  }
  if (!hasPrivateRecord) {
    return translate("privateLabel");
  }
  return "—";
}

export function resolveDetailChainHint(
  chainEntry: ChainDetailsEntry | undefined,
  translate: TFunction<"transactionDetails", undefined>,
): string | undefined {
  if (chainEntry?.status === "loading") {
    return translate("chainLoading");
  }
  if (chainEntry?.status === "failed") {
    return chainEntry.error;
  }
}

export interface DetailDateTimeRowInput {
  chainCreatedAtSeconds: number | undefined;
  chainEntry: ChainDetailsEntry | undefined;
  translate: TFunction<"transactionDetails", undefined>;
}

export function resolveDetailDateTimeRowContent(
  input: DetailDateTimeRowInput,
): string {
  const { chainCreatedAtSeconds, chainEntry, translate } = input;
  const createdAtSeconds = parseStellarRpcUnixTimestampSeconds(
    chainCreatedAtSeconds,
  );
  if (createdAtSeconds !== undefined) {
    return formatDetailViewDateTimeFromUnixSeconds(createdAtSeconds);
  }
  if (!chainEntry || chainEntry.status === "loading") {
    return translate("chainLoading");
  }
  return "—";
}
