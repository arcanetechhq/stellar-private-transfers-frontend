import type {
  StellarPreparedOperation,
  StellarPrivacyClient,
} from "@arcanetech/privacy-sdk-stellar";
import { mapPrivacySdkErrors } from "@/shared/lib/privacy-sdk/map-privacy-sdk-errors.js";

const PRIVATE_TRANSFER_DISCLOSURE = {
  senderAddress: "private" as const,
  recipientAddress: "private" as const,
  assetAddress: "private" as const,
  amount: "private" as const,
};

export async function prepareSdkTransfer(parameters: {
  client: StellarPrivacyClient;
  senderPrivateAddress: string;
  recipientAddress: string;
  assetId: string;
  amountStroops: bigint;
}): Promise<{
  prepared: StellarPreparedOperation;
  execute: () => Promise<{ operationId: string }>;
}> {
  const prepared = await parameters.client.transfer({
    from: parameters.senderPrivateAddress,
    to: parameters.recipientAddress,
    asset: parameters.assetId,
    amount: parameters.amountStroops,
    disclosure: PRIVATE_TRANSFER_DISCLOSURE,
  });
  if (prepared.status === "rejected") {
    throw new Error(mapPrivacySdkErrors(prepared.errors));
  }
  return {
    prepared: prepared.prepared,
    execute: async () => {
      const receipt = await prepared.execute();
      return { operationId: receipt.operationId || "" };
    },
  };
}
