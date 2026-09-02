import type { AppDispatch } from "@/store";
import type { CoinWithMetadata } from "@/entities/coin";

export interface RunConfidentialTransferInput {
  dispatch: AppDispatch;
  walletPublicKey: string;
  networkPassphrase: string;
  sorobanRpcUrl: string;
  senderPrivateAddress: string;
  recipientStellarAddress: string;
  recipientPrivateAddressStpl1: string;
  assetId: string;
  tokenContractRaw: string;
  amountDisplay: number;
  finalizedCoinsForSenderAndAsset: CoinWithMetadata[];
}

export interface RunConfidentialTransferResult {
  txId: string;
  coinDeliveryWarning?: string;
}
