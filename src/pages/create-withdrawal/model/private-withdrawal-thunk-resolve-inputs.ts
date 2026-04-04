import type { RootState } from "@/app/store";
import {
  pickCoinsForTransfer,
  selectCoinItems,
  type CoinWithMetadata,
} from "@/entities/coin";
import { selectWalletPublicKey } from "@/entities/wallet";
import { getDefaultStellarNetworkConfig } from "@/shared/stellar/stellar-network-environment";
import { displayAmountToStroops } from "@/shared/lib/stellar/stroops";
import type { SubmitPrivateWithdrawalPayload } from "./private-withdrawal-submit-payload";

export type PrivateWithdrawThunkResolved =
  | { kind: "reject"; rejected: unknown }
  | {
      kind: "ok";
      walletPublicKey: string;
      networkPassphrase: string;
      sorobanRpcUrl: string;
      senderTrim: string;
      pickedCoins: CoinWithMetadata[];
      payload: SubmitPrivateWithdrawalPayload;
    };

export function resolvePrivateWithdrawThunkInputs(parameters: {
  state: RootState;
  payload: SubmitPrivateWithdrawalPayload;
  rejectWithValue: (value: string) => unknown;
}): PrivateWithdrawThunkResolved {
  const walletPublicKey = selectWalletPublicKey(parameters.state);
  if (!walletPublicKey?.trim()) {
    return {
      kind: "reject",
      rejected: parameters.rejectWithValue("Wallet not connected"),
    };
  }
  const senderTrim = parameters.payload.senderStealthAddress.trim();
  const finalizedForSenderAndAsset = selectCoinItems(parameters.state).filter(
    (item) =>
      item.stealthAddress === senderTrim &&
      item.status === "finalized" &&
      item.assetId === parameters.payload.assetId,
  );
  const { sorobanRpcUrl, networkPassphrase } = getDefaultStellarNetworkConfig();
  let withdrawStroops: bigint;
  try {
    withdrawStroops = displayAmountToStroops(parameters.payload.amountDisplay);
  } catch {
    return {
      kind: "reject",
      rejected: parameters.rejectWithValue("Invalid withdraw amount"),
    };
  }
  let pickedCoins: CoinWithMetadata[];
  try {
    pickedCoins = pickCoinsForTransfer({
      finalizedCoins: finalizedForSenderAndAsset,
      transferStroops: withdrawStroops,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Cannot select coins for withdrawal";
    return { kind: "reject", rejected: parameters.rejectWithValue(message) };
  }
  if (pickedCoins.length !== 1 && pickedCoins.length !== 2) {
    return {
      kind: "reject",
      rejected: parameters.rejectWithValue(
        "Unsupported coin selection count for withdrawal",
      ),
    };
  }
  return {
    kind: "ok",
    walletPublicKey,
    networkPassphrase,
    sorobanRpcUrl,
    senderTrim,
    pickedCoins,
    payload: parameters.payload,
  };
}
