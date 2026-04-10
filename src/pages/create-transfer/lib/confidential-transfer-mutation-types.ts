import type { AppDispatch } from "@/store";
import type { CoinWithMetadata } from "@/entities/coin";

export interface RunConfidentialTransferInput {
  dispatch: AppDispatch;
  walletPublicKey: string;
  networkPassphrase: string;
  sorobanRpcUrl: string;
  senderPrivKeyScalarHex: string;
  senderStealthAddress: string;
  recipientStealthStpl1: string;
  assetId: string;
  poolContractRaw: string;
  amountDisplay: number;
  finalizedCoinsForSenderAndAsset: CoinWithMetadata[];
}

export interface RunConfidentialTransferResult {
  txId: string;
  coinDeliveryWarning?: string;
}
