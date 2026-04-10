import type { RootState } from "@/store";
import {
  pickCoinsForTransfer,
  selectCoinItems,
  type CoinWithMetadata,
} from "@/entities/coin";
import { selectScalarByStealthAddress } from "@/entities/stealth-address";
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
      senderPrivKeyScalarHex: string;
      senderTrim: string;
      pickedCoins: CoinWithMetadata[];
      payload: SubmitPrivateWithdrawalPayload;
    };

type PickWithdrawCoinsResult =
  | { kind: "reject"; rejected: unknown }
  | { kind: "ok"; pickedCoins: CoinWithMetadata[]; withdrawStroops: bigint };

function pickCoinsForPrivateWithdraw(parameters: {
  finalizedCoins: CoinWithMetadata[];
  amountDisplay: number;
  rejectWithValue: (value: string) => unknown;
}): PickWithdrawCoinsResult {
  let withdrawStroops: bigint;
  try {
    withdrawStroops = displayAmountToStroops(parameters.amountDisplay);
  } catch {
    return {
      kind: "reject",
      rejected: parameters.rejectWithValue("Invalid withdraw amount"),
    };
  }
  let pickedCoins: CoinWithMetadata[];
  try {
    pickedCoins = pickCoinsForTransfer({
      finalizedCoins: parameters.finalizedCoins,
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
  return { kind: "ok", pickedCoins, withdrawStroops };
}

function readTrimmedSenderPrivKeyScalarHex(
  state: RootState,
  senderStealthAddress: string,
): string | undefined {
  const hex = selectScalarByStealthAddress(senderStealthAddress)(state)?.trim();
  return hex || undefined;
}

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
  const pickResult = pickCoinsForPrivateWithdraw({
    finalizedCoins: finalizedForSenderAndAsset,
    amountDisplay: parameters.payload.amountDisplay,
    rejectWithValue: parameters.rejectWithValue,
  });
  if (pickResult.kind === "reject") {
    return pickResult;
  }
  const senderPrivKeyScalarHex = readTrimmedSenderPrivKeyScalarHex(
    parameters.state,
    senderTrim,
  );
  if (!senderPrivKeyScalarHex) {
    return {
      kind: "reject",
      rejected: parameters.rejectWithValue(
        "Stealth key scalar is missing; open stealth settings first",
      ),
    };
  }
  return {
    kind: "ok",
    walletPublicKey,
    networkPassphrase,
    sorobanRpcUrl,
    senderPrivKeyScalarHex,
    senderTrim,
    pickedCoins: pickResult.pickedCoins,
    payload: parameters.payload,
  };
}
