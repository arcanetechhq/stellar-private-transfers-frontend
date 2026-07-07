import { displayAmountToStroops } from "@/shared/lib/stellar/stroops";
import { getPrivacySdkClientOrThrow } from "@/shared/lib/privacy-sdk/transact-context.js";
import { getRequiredPrivacyPoolContractId } from "@/shared/stellar/stellar-network-environment";
import { validateTransferOperation } from "@/shared/lib/privacy-sdk/operation-adapters.js";
import { postOutputRecordDeliveries } from "@/entities/coin-deliveries";
import type { RunConfidentialTransferInput } from "./confidential-transfer-mutation-types";
import type { RecipientTransferTarget } from "./run-confidential-transfer-mutation";
import { executeSdkTransfer } from "./run-confidential-transfer-sdk-execute";

async function registerResolverAndValidate(parameters: {
  input: RunConfidentialTransferInput;
  senderTrim: string;
  recipientAddress: string;
  onboardingRecipient: boolean;
}): Promise<ReturnType<typeof getPrivacySdkClientOrThrow>> {
  const privacyClient = getPrivacySdkClientOrThrow();
  await validateTransferOperation(privacyClient, {
    senderPrivateAddress: parameters.senderTrim,
    recipientAddress: parameters.recipientAddress,
    assetId: parameters.input.assetId,
    amountStroops: displayAmountToStroops(parameters.input.amountDisplay),
    onboardingRecipient: parameters.onboardingRecipient,
  });
  return privacyClient;
}

type PreparedTransferContext = {
  recipientTarget: RecipientTransferTarget;
  recipientStellarAddress: string;
  senderTrim: string;
  transferStroops: bigint;
  privacyClient: ReturnType<typeof getPrivacySdkClientOrThrow>;
  input: RunConfidentialTransferInput;
};

async function buildPreparedTransferContext(parameters: {
  input: RunConfidentialTransferInput;
  recipientTarget: RecipientTransferTarget;
}): Promise<PreparedTransferContext> {
  const { input, recipientTarget } = parameters;
  const poolContractId = getRequiredPrivacyPoolContractId();
  const recipientStellarAddress = input.recipientStellarAddress.trim();
  const senderTrim = input.senderPrivateAddress.trim();
  const transferStroops = displayAmountToStroops(input.amountDisplay);
  const privacyClient = await registerResolverAndValidate({
    input,
    senderTrim,
    recipientAddress: recipientTarget.temporaryKeyMaterial
      ? recipientStellarAddress
      : recipientTarget.recipientPrivateAddressStpl1,
    onboardingRecipient: recipientTarget.temporaryKeyMaterial !== undefined,
  });
  await privacyClient.syncPoolMerkleState({
    poolContractId,
    walletPublicKey: input.walletPublicKey,
  });
  return {
    input,
    recipientTarget,
    recipientStellarAddress,
    senderTrim,
    transferStroops,
    privacyClient,
  };
}

async function executeWithSdk(
  context: PreparedTransferContext,
): Promise<{ txId: string; coinDeliveryWarning?: string }> {
  const executed = await executeSdkTransfer({
    client: context.privacyClient,
    senderPrivateAddress: context.senderTrim,
    recipientAddress: context.recipientTarget.temporaryKeyMaterial
      ? context.recipientStellarAddress
      : context.recipientTarget.recipientPrivateAddressStpl1,
    assetId: context.input.assetId,
    amountStroops: context.transferStroops,
    onboardingRecipient: context.recipientTarget.temporaryKeyMaterial !== undefined,
  });
  if (!executed.operationId) {
    throw new Error("SDK transfer execute did not return operation id");
  }
  const coinDeliveryWarning = await postOutputRecordDeliveries({
    outputRecords: executed.outputRecords,
    txId: executed.operationId,
    dispatch: context.input.dispatch,
  });
  return {
    txId: executed.operationId,
    ...(coinDeliveryWarning ? { coinDeliveryWarning } : {}),
  };
}

export async function prepareTransferExecution(parameters: {
  input: RunConfidentialTransferInput;
  recipientTarget: RecipientTransferTarget;
}): Promise<{ txId: string; coinDeliveryWarning?: string }> {
  const context = await buildPreparedTransferContext(parameters);
  return executeWithSdk(context);
}
