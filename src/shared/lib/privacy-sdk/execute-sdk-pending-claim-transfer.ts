import type {
  StellarPendingClaim,
  StellarPrivacyClient,
  StellarPrivateRecord,
} from "@arcanetech/privacy-sdk-stellar";
import type { PendingClaimItem } from "@/entities/pending-claims/model/pending-claim-types.js";
import { mapPrivacySdkError, mapPrivacySdkErrors } from "@/shared/lib/privacy-sdk/map-privacy-sdk-errors.js";

export const PENDING_CLAIM_TRANSFER_DISCLOSURE = {
  senderAddress: "public" as const,
  recipientAddress: "private" as const,
  assetAddress: "public" as const,
  amount: "public" as const,
};

export function mapPendingClaimItemToSdkClaim(
  claim: PendingClaimItem,
  assetId: string,
): StellarPendingClaim {
  return {
    id: String(claim.id),
    owner: claim.ownerAddress,
    asset: assetId,
    amount: BigInt(claim.noteValue),
    createdAt: claim.createdAt,
    poolTxId: claim.poolTxId,
    commitmentHex: claim.commitmentHex,
    nullifierHex: claim.nullifierHex,
    futureNullifierHashHex: claim.futureNullifierHashHex,
    assetHiHex: claim.assetHiHex,
    assetLoHex: claim.assetLoHex,
    nullifierFieldHex: claim.nullifierFieldHex,
    secretHex: claim.secretHex,
    tempPublicKeyXHex: claim.tempPublicKeyXHex,
    tempPublicKeyYHex: claim.tempPublicKeyYHex,
    encryptedRecoveryBase64: claim.encryptedRecoveryBase64,
    createdAtLedger: claim.createdAtLedger,
  };
}

export async function executeSdkPendingClaimTransfer(parameters: {
  client: StellarPrivacyClient;
  claim: PendingClaimItem;
  assetId: string;
  permanentPrivateAddress: string;
}): Promise<{ operationId: string; outputRecord?: StellarPrivateRecord }> {
  const prepared = await parameters.client.transfer({
    from: {
      kind: "pendingClaim",
      claim: mapPendingClaimItemToSdkClaim(parameters.claim, parameters.assetId),
    },
    to: parameters.permanentPrivateAddress.trim(),
    asset: parameters.assetId,
    amount: BigInt(parameters.claim.noteValue),
    disclosure: PENDING_CLAIM_TRANSFER_DISCLOSURE,
  });
  if (prepared.status === "rejected") {
    throw new Error(mapPrivacySdkErrors(prepared.errors));
  }
  try {
    const receipt = await prepared.execute();
    const operationId = receipt.operationId || "";
    if (!operationId) {
      throw new Error("SDK pending claim transfer did not return operation id");
    }
    return {
      operationId,
      outputRecord: prepared.prepared.outputRecords[0],
    };
  } catch (error) {
    throw new Error(mapPrivacySdkError(error));
  }
}
