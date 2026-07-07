import type { AssetDto } from "@/entities/asset";
import { shortenPrivateAddressForDisplay } from "@/shared/lib/private-address/shorten-private-address-for-display";

export interface TransferSuccessLocationState {
  amount?: number;
  assetId?: string;
  poolContract?: string;
  txId?: unknown;
  coinDeliveryWarning?: string;
}

export interface TransferSuccessViewModel {
  txId: string;
  ticker: string;
  logoUrl: string | undefined;
  amountDisplay: string;
  formattedTime: string;
  transactionIdShort: string;
  fullTransactionId: string;
  showActions: boolean;
}

export interface BuildTransferSuccessViewInput {
  state: TransferSuccessLocationState | undefined;
  routeId: string | undefined;
  assetMatch: AssetDto | undefined;
  fallbackTransactionLabel: string;
  language: string;
}

function amountFromState(
  state: TransferSuccessLocationState | undefined,
): number | undefined {
  if (typeof state?.amount !== "number") {
    return undefined;
  }
  return Number.isFinite(state.amount) ? state.amount : undefined;
}

function formatAmountDisplay(amount: number | undefined): string {
  if (amount === undefined) {
    return "—";
  }
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 7,
  });
}

function resolveTicker(
  stateAssetId: string | undefined,
  poolAssetId: string | undefined,
): string {
  const raw = stateAssetId ?? poolAssetId ?? "—";
  return raw.toUpperCase();
}

function readTrimmedString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed || undefined;
}

function readReceiptOperationId(value: unknown): string | undefined {
  if (typeof value !== "object" || value === null) {
    return undefined;
  }
  if (!Object.hasOwn(value, "operationId")) {
    return undefined;
  }
  return readTrimmedString((value as { operationId?: unknown }).operationId);
}

function resolveTransactionId(stateTxId: unknown, routeId: string | undefined): string {
  return (
    readTrimmedString(stateTxId) ??
    readReceiptOperationId(stateTxId) ??
    readTrimmedString(routeId) ??
    ""
  );
}

export function buildTransferSuccessViewModel(
  input: BuildTransferSuccessViewInput,
): TransferSuccessViewModel {
  const txId = resolveTransactionId(input.state?.txId, input.routeId);
  const ticker = resolveTicker(
    input.state?.assetId,
    input.assetMatch?.assetId,
  );
  const logoUrl = input.assetMatch?.logoUrl;
  const amountDisplay = formatAmountDisplay(amountFromState(input.state));

  const formattedTime = new Date().toLocaleString(input.language, {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const transactionIdShort =
    txId.length > 0 ? shortenPrivateAddressForDisplay(txId) : "—";

  return {
    txId,
    ticker,
    logoUrl,
    amountDisplay,
    formattedTime,
    transactionIdShort,
    fullTransactionId: txId || input.fallbackTransactionLabel,
    showActions: Boolean(txId),
  };
}
