import type { AppDispatch, RootState } from "@/store";
import {
  runPrivateWithdrawalMutation,
  type RunPrivateWithdrawalMutationResult,
} from "../lib/run-private-withdrawal-mutation";
import type { SubmitPrivateWithdrawalPayload } from "./private-withdrawal-submit-payload";
import { resolvePrivateWithdrawThunkInputs } from "./private-withdrawal-thunk-resolve-inputs";

export async function submitPrivateWithdrawalThunkBody(
  payload: SubmitPrivateWithdrawalPayload,
  parameters: {
    getState: () => RootState;
    dispatch: AppDispatch;
    rejectWithValue: (value: string) => unknown;
  },
): Promise<RunPrivateWithdrawalMutationResult> {
  const resolved = resolvePrivateWithdrawThunkInputs({
    state: parameters.getState(),
    payload,
    rejectWithValue: parameters.rejectWithValue,
  });
  if (resolved.kind === "reject") {
    return resolved.rejected as RunPrivateWithdrawalMutationResult;
  }
  try {
    return await runPrivateWithdrawalMutation({
      dispatch: parameters.dispatch,
      walletPublicKey: resolved.walletPublicKey,
      networkPassphrase: resolved.networkPassphrase,
      sorobanRpcUrl: resolved.sorobanRpcUrl,
      senderPrivKeyScalarHex: resolved.senderPrivKeyScalarHex,
      senderStealthAddress: resolved.senderTrim,
      assetId: resolved.payload.assetId,
      poolContractRaw: resolved.payload.poolContractRaw,
      amountDisplay: resolved.payload.amountDisplay,
      destinationAddress: resolved.payload.destinationAddress,
      pickedCoins: resolved.pickedCoins,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Withdrawal failed";
    return parameters.rejectWithValue(message) as RunPrivateWithdrawalMutationResult;
  }
}
