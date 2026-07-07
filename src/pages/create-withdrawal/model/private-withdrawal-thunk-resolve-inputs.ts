import type { RootState } from "@/store";
import { selectWalletPublicKey } from "@/entities/wallet";
import { getDefaultStellarNetworkConfig } from "@/shared/stellar/stellar-network-environment";
import type { SubmitPrivateWithdrawalPayload } from "./private-withdrawal-submit-payload";

export type PrivateWithdrawThunkResolved =
  | { kind: "reject"; rejected: unknown }
  | {
      kind: "ok";
      walletPublicKey: string;
      networkPassphrase: string;
      sorobanRpcUrl: string;
      senderTrim: string;
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
  const senderTrim = parameters.payload.senderPrivateAddress.trim();
  const { sorobanRpcUrl, networkPassphrase } = getDefaultStellarNetworkConfig();
  return {
    kind: "ok",
    walletPublicKey,
    networkPassphrase,
    sorobanRpcUrl,
    senderTrim,
    payload: parameters.payload,
  };
}
