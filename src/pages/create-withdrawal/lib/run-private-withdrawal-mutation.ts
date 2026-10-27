import { displayAmountToStroops } from "@/shared/lib/stellar/stroops";
import {
  mapPrivacySdkError,
  mapPrivacySdkErrors,
} from "@/shared/lib/privacy-sdk/map-privacy-sdk-errors.js";
import { getPrivacySdkClientOrThrow } from "@/shared/lib/privacy-sdk/transact-context.js";
import { getRequiredPrivacyPoolContractId } from "@/shared/stellar/stellar-network-environment";
import { routePreparedTransact } from "@/shared/lib/protocol-relay";
import { createAppRelayPorts } from "@/features/submit-private-operation";
import type {
  RunPrivateWithdrawalMutationInput,
  RunPrivateWithdrawalMutationResult,
} from "./private-withdrawal-mutation-contract";

export type {
  RunPrivateWithdrawalMutationInput,
  RunPrivateWithdrawalMutationResult,
} from "./private-withdrawal-mutation-contract";

export async function runPrivateWithdrawalMutation(
  input: RunPrivateWithdrawalMutationInput,
): Promise<RunPrivateWithdrawalMutationResult> {
  const privacyClient = getPrivacySdkClientOrThrow();
  await privacyClient.syncPoolMerkleState({
    poolContractId: getRequiredPrivacyPoolContractId(),
    walletPublicKey: input.walletPublicKey,
  });
  const operation = await privacyClient.withdraw({
    from: input.senderPrivateAddress.trim(),
    to: input.destinationAddress.trim(),
    asset: input.assetId,
    amount: displayAmountToStroops(input.amountDisplay),
    disclosure: {
      senderAddress: "private",
      recipientAddress: "public",
      assetAddress: "public",
      amount: "public",
    },
  });
  if (operation.status === "rejected") {
    throw new Error(mapPrivacySdkErrors(operation.errors));
  }
  try {
    return await routePreparedTransact({
      ports: createAppRelayPorts({
        dispatch: input.dispatch,
        submitDirect: async () => {
          const receipt = await operation.execute();
          const txId = receipt.operationId;
          if (!txId) {
            throw new Error(
              "Withdrawal transaction did not return an operation id",
            );
          }
          return { txId };
        },
      }),
      walletPublicKey: input.walletPublicKey,
      prepared: operation.prepared,
      display: {
        kind: "withdraw",
        assetId: input.assetId,
        amountDisplay: input.amountDisplay,
        counterparty: input.destinationAddress.trim(),
        senderPrivateAddress: input.senderPrivateAddress.trim(),
      },
    });
  } catch (error: unknown) {
    throw error instanceof Error ? error : new Error(mapPrivacySdkError(error));
  }
}
