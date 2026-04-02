import type { AssetDto } from "@/entities/asset";
import { shortenStealthForDisplay } from "@/features/pick-stealth-address";

export interface TransferSuccessLocationState {
  amount?: number;
  assetId?: string;
  poolContract?: string;
  txId?: string;
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

export function buildTransferSuccessViewModel(
  input: BuildTransferSuccessViewInput,
): TransferSuccessViewModel {
  const txId = (input.state?.txId ?? input.routeId ?? "").trim();
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
    txId.length > 0 ? shortenStealthForDisplay(txId) : "—";

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
