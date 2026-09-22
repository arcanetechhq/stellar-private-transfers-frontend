import type {
  StellarPoolMerkleState,
  StellarPrivacyClient,
  StellarPrivateRecord,
} from "@arcanetech/privacy-sdk-stellar";
import {
  mergeLegacyPrivateAddressIntoSdkBranch,
  readWalletPrivateAddressViewFromSdkBranch,
} from "@/shared/lib/privacy-sdk/wallet-private-address-sdk-branch.js";
import { loadAllPoolMerkleStates } from "./persist-pool-merkle.js";
import { loadPrivacySdkState } from "./persist-privacy-sdk-state.js";

type LegacyPrivateAddress = Parameters<
  typeof mergeLegacyPrivateAddressIntoSdkBranch
>[0]["legacy"];

type HydrationSnapshot = {
  poolMerkleStates?: StellarPoolMerkleState[];
  privateRecords?: StellarPrivateRecord[];
  walletPrivateAddressRecords?: Array<{
    owner: string;
    nonce: string;
    privateAddress: string;
    createdAt: number;
  }>;
  walletPrivateAddressScalars?: Array<{
    owner: string;
    nonce: string;
    scalarHex: string;
  }>;
  walletDefaultPrivateAddressNonces?: Array<{ owner: string; nonce: string }>;
};

type HydrateCapableClient = StellarPrivacyClient & {
  hydrateState: (snapshot: HydrationSnapshot) => Promise<void>;
};

function isHydrateCapable(
  client: StellarPrivacyClient,
): client is HydrateCapableClient {
  return typeof (client as HydrateCapableClient).hydrateState === "function";
}

function privateRecordsFromBranch(
  branch: Record<string, unknown>,
): StellarPrivateRecord[] {
  const records = branch.privateRecords;
  if (!Array.isArray(records)) {
    return [];
  }
  return records.filter(
    (record): record is StellarPrivateRecord =>
      typeof record === "object" &&
      record !== null &&
      typeof (record as StellarPrivateRecord).id === "string",
  );
}

async function hydrateViaPublicMethods(
  client: StellarPrivacyClient,
  snapshot: HydrationSnapshot,
): Promise<void> {
  for (const poolState of snapshot.poolMerkleStates ?? []) {
    await client.setPoolMerkleState(poolState);
  }
  if (snapshot.privateRecords && snapshot.privateRecords.length > 0) {
    await client.upsertPrivateRecords(snapshot.privateRecords);
  }
  for (const record of snapshot.walletPrivateAddressRecords ?? []) {
    await client.saveWalletPrivateAddressRecord(record);
  }
  for (const scalar of snapshot.walletPrivateAddressScalars ?? []) {
    await client.saveWalletPrivateAddressScalar(scalar);
  }
  for (const entry of snapshot.walletDefaultPrivateAddressNonces ?? []) {
    await client.setWalletDefaultPrivateAddressNonce(entry);
  }
}

function walletHydrationSnapshot(input: {
  owner: string;
  branch: Record<string, unknown>;
  poolMerkleStates: StellarPoolMerkleState[];
}): HydrationSnapshot {
  const view = readWalletPrivateAddressViewFromSdkBranch({
    branch: input.branch,
    owner: input.owner,
  });
  const records = Object.entries(view.byNonce).map(([nonce, entry]) => ({
    owner: input.owner,
    nonce,
    privateAddress: entry.privateAddress,
    createdAt: entry.createdAt,
  }));
  const scalars = Object.entries(view.scalarByNonce).map(
    ([nonce, scalarHex]) => ({
      owner: input.owner,
      nonce,
      scalarHex,
    }),
  );
  const privateRecords = privateRecordsFromBranch(input.branch);
  return {
    ...(input.poolMerkleStates.length > 0
      ? { poolMerkleStates: input.poolMerkleStates }
      : {}),
    ...(privateRecords.length > 0 ? { privateRecords } : {}),
    ...(records.length > 0 ? { walletPrivateAddressRecords: records } : {}),
    ...(scalars.length > 0 ? { walletPrivateAddressScalars: scalars } : {}),
    ...(view.defaultNonce
      ? {
          walletDefaultPrivateAddressNonces: [
            { owner: input.owner, nonce: view.defaultNonce },
          ],
        }
      : {}),
  };
}

export async function hydratePrivacySdkClient(input: {
  client: StellarPrivacyClient;
  walletPublicKey: string;
  legacyPrivateAddress?: LegacyPrivateAddress;
}): Promise<void> {
  const owner = input.walletPublicKey.trim();
  if (!owner) {
    return;
  }
  const snapshot = walletHydrationSnapshot({
    owner,
    branch: mergeLegacyPrivateAddressIntoSdkBranch({
      branch: loadPrivacySdkState(owner) ?? {},
      owner,
      legacy: input.legacyPrivateAddress,
    }),
    poolMerkleStates: await loadAllPoolMerkleStates(),
  });
  if (isHydrateCapable(input.client)) {
    await input.client.hydrateState(snapshot);
    return;
  }
  await hydrateViaPublicMethods(input.client, snapshot);
}
