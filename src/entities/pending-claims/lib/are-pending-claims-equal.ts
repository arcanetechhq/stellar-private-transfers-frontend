import type { PendingClaimItem } from "../model/pending-claim-types.js";

function isSamePendingClaim(
  left: PendingClaimItem,
  right: PendingClaimItem,
): boolean {
  return (
    left.id === right.id &&
    left.ownerAddress === right.ownerAddress &&
    left.poolTxId === right.poolTxId &&
    left.commitmentHex === right.commitmentHex &&
    left.nullifierHex === right.nullifierHex &&
    left.futureNullifierHashHex === right.futureNullifierHashHex &&
    left.noteValue === right.noteValue &&
    left.assetHiHex === right.assetHiHex &&
    left.assetLoHex === right.assetLoHex &&
    left.nullifierFieldHex === right.nullifierFieldHex &&
    left.secretHex === right.secretHex &&
    left.tempPublicKeyXHex === right.tempPublicKeyXHex &&
    left.tempPublicKeyYHex === right.tempPublicKeyYHex &&
    left.encryptedRecoveryBase64 === right.encryptedRecoveryBase64 &&
    left.createdAtLedger === right.createdAtLedger &&
    left.createdAt === right.createdAt
  );
}

export function arePendingClaimsEqual(
  left: readonly PendingClaimItem[],
  right: readonly PendingClaimItem[],
): boolean {
  if (left === right) {
    return true;
  }
  if (left.length !== right.length) {
    return false;
  }
  return left.every((claim, index) => {
    const other = right[index];
    return other !== undefined && isSamePendingClaim(claim, other);
  });
}
