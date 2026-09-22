import type { StellarPoolMerkleState } from "@arcanetech/privacy-sdk-stellar";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isPoolMerkleState(
  value: unknown,
): value is StellarPoolMerkleState {
  if (!isRecord(value)) {
    return false;
  }
  return (
    typeof value.poolContract === "string" &&
    Array.isArray(value.commitments) &&
    typeof value.commitmentCount === "number" &&
    typeof value.merkleRootHex === "string"
  );
}

export function readPoolMerkleStatesFromSdkBranch(
  branch: Record<string, unknown>,
): StellarPoolMerkleState[] {
  const pools = isRecord(branch.pools) ? branch.pools : undefined;
  const byContract = pools && isRecord(pools.byContract) ? pools.byContract : {};
  return Object.values(byContract).filter((value) => isPoolMerkleState(value));
}

export function walletScopedPrivacySdkBranch(
  branch: Record<string, unknown>,
): Record<string, unknown> {
  const next: Record<string, unknown> = {};
  if (Object.hasOwn(branch, "privateRecords")) {
    next.privateRecords = branch.privateRecords;
  }
  if (Object.hasOwn(branch, "wallet")) {
    next.wallet = branch.wallet;
  }
  return next;
}
