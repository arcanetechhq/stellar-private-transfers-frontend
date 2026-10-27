import { displayAmountToStroops } from "@/shared/lib/stellar/stroops";
import { getPrivacySdkClientOrThrow } from "@/shared/lib/privacy-sdk/transact-context.js";
import { getRequiredPrivacyPoolContractId } from "@/shared/stellar/stellar-network-environment";
import { routePreparedTransact } from "@/shared/lib/protocol-relay";
import { createAppRelayPorts } from "@/features/submit-private-operation";
import type { RunConfidentialTransferInput } from "./confidential-transfer-mutation-types";
import type { RecipientTransferTarget } from "./run-confidential-transfer-mutation";
import { prepareSdkTransfer } from "./run-confidential-transfer-sdk-execute";

export async function prepareTransferExecution(parameters: {
  input: RunConfidentialTransferInput;
  recipientTarget: RecipientTransferTarget;
}): Promise<{ txId: string; coinDeliveryWarning?: string }> {
  const { input, recipientTarget } = parameters;
  const poolContractId = getRequiredPrivacyPoolContractId();
  const recipientStellarAddress = input.recipientStellarAddress.trim();
  const senderTrim = input.senderPrivateAddress.trim();
  const isEscrowSend = recipientTarget.escrowSend !== undefined;
  const recipientAddress = isEscrowSend
    ? recipientStellarAddress
    : recipientTarget.recipientPrivateAddressStpl1;
  const privacyClient = getPrivacySdkClientOrThrow();
  await privacyClient.syncPoolMerkleState({
    poolContractId,
    walletPublicKey: input.walletPublicKey,
  });
  const prepared = await prepareSdkTransfer({
    client: privacyClient,
    senderPrivateAddress: senderTrim,
    recipientAddress,
    assetId: input.assetId,
    amountStroops: displayAmountToStroops(input.amountDisplay),
  });
  return routePreparedTransact({
    ports: createAppRelayPorts({
      dispatch: input.dispatch,
      submitDirect: async () => {
        const receipt = await prepared.execute();
        if (!receipt.operationId) {
          throw new Error("SDK transfer execute did not return operation id");
        }
        return { txId: receipt.operationId };
      },
    }),
    walletPublicKey: input.walletPublicKey,
    prepared: prepared.prepared,
    ...(isEscrowSend ? { escrowSend: true } : {}),
    display: {
      kind: "transfer",
      assetId: input.assetId,
      amountDisplay: input.amountDisplay,
      counterparty: recipientStellarAddress,
      senderPrivateAddress: senderTrim,
    },
  });
}
