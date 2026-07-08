import type { StellarPendingClaim } from "@arcanetech/privacy-sdk-stellar";
import type { PendingClaimItem } from "../model/pending-claim-types.js";

function defaultString(value: string | undefined): string {
  return value ?? "";
}

function readOptionalPendingClaimFields(
  claim: StellarPendingClaim,
): Omit<PendingClaimItem, "id" | "ownerAddress" | "noteValue" | "createdAt"> {
  return {
    poolTxId: defaultString(claim.poolTxId),
    commitmentHex: defaultString(claim.commitmentHex),
    nullifierHex: defaultString(claim.nullifierHex),
    futureNullifierHashHex: defaultString(claim.futureNullifierHashHex),
    assetHiHex: defaultString(claim.assetHiHex),
    assetLoHex: defaultString(claim.assetLoHex),
    nullifierFieldHex: defaultString(claim.nullifierFieldHex),
    secretHex: defaultString(claim.secretHex),
    tempPublicKeyXHex: defaultString(claim.tempPublicKeyXHex),
    tempPublicKeyYHex: defaultString(claim.tempPublicKeyYHex),
    encryptedRecoveryBase64: defaultString(claim.encryptedRecoveryBase64),
    createdAtLedger: claim.createdAtLedger ?? 0,
  };
}

export function mapSdkPendingClaimToItem(
  claim: StellarPendingClaim,
): PendingClaimItem {
  return {
    id: Number.parseInt(claim.id, 10),
    ownerAddress: claim.owner,
    noteValue: claim.amount.toString(),
    createdAt: claim.createdAt,
    ...readOptionalPendingClaimFields(claim),
  };
}
