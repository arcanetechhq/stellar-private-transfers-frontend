import type { AssetDto } from "@/entities/asset";
import { shortenPrivateAddressForDisplay } from "@/shared/lib/private-address/shorten-private-address-for-display";

export type TransferSuccessFlow = "deposit" | "transfer" | "withdrawal";

export interface TransferSuccessLocationState {
  amount?: number;
  assetId?: string;
  poolContract?: string;
  txId?: string;
  coinDeliveryWarning?: string;
  flow?: TransferSuccessFlow;
}

export interface TransferSuccessViewModel {
  flow: TransferSuccessFlow;
  txId: string;
  ticker: string;
  logoUrl: string | undefined;
  amountDisplay: string;
  amountWithTicker: string;
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

function formatAmountWithTicker(
  amount: number | undefined,
  amountDisplay: string,
  ticker: string,
): string {
  if (amount === undefined) {
    return "—";
  }
  return `${amountDisplay} ${ticker}`.trim();
}

function resolveFlow(
  stateFlow: TransferSuccessFlow | undefined,
): TransferSuccessFlow {
  if (
    stateFlow === "deposit" ||
    stateFlow === "transfer" ||
    stateFlow === "withdrawal"
  ) {
    return stateFlow;
  }
  return "transfer";
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
  const amount = amountFromState(input.state);
  const amountDisplay = formatAmountDisplay(amount);
  const amountWithTicker = formatAmountWithTicker(amount, amountDisplay, ticker);
  const flow = resolveFlow(input.state?.flow);

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
    flow,
    txId,
    ticker,
    logoUrl,
    amountDisplay,
    amountWithTicker,
    formattedTime,
    transactionIdShort,
    fullTransactionId: txId || input.fallbackTransactionLabel,
    showActions: Boolean(txId),
  };
}
