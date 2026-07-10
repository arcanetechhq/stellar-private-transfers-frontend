import type { AppDispatch, RootState } from "@/store";
import { mapPrivacySdkError } from "@/shared/lib/privacy-sdk/map-privacy-sdk-errors.js";
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
      senderPrivateAddress: resolved.senderTrim,
      assetId: resolved.payload.assetId,
      tokenContractRaw: resolved.payload.tokenContractRaw,
      amountDisplay: resolved.payload.amountDisplay,
      destinationAddress: resolved.payload.destinationAddress,
    });
  } catch (error: unknown) {
    return parameters.rejectWithValue(
      mapPrivacySdkError(error),
    ) as RunPrivateWithdrawalMutationResult;
  }
}
