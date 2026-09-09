import type { StellarPreparedOperation } from "@arcanetech/privacy-sdk-stellar";
import { submitSorobanConfidentialTransfer } from "@arcanetech/privacy-sdk-stellar/transact";
import type { AppDispatch } from "@/store";
import { routePreparedTransact } from "@/shared/lib/protocol-relay";
import { getPrivacyTransactEnvironment } from "@/shared/lib/privacy-sdk/transact-context.js";
import { stroopsToDisplayAmount } from "@/shared/lib/stellar/stroops.js";
import { bindEscrowSweepRelayPorts } from "./bind-escrow-sweep-ports.js";
import type { EscrowClaimAssetCatalogEntry } from "./pending-escrow-asset-claims.js";
import { stampSweepPersistAsset } from "./stamp-sweep-persist-asset.js";

function readTrimmedArtifact(
  artifacts: StellarPreparedOperation["transactArtifacts"],
  key: "proofHex" | "publicHex" | "walletPublicKey",
): string | undefined {
  const value = artifacts?.[key]?.trim();
  return value && value.length > 0 ? value : undefined;
}

function requireSweepSubmitArtifacts(prepared: StellarPreparedOperation): {
  proofHex: string;
  publicHex: string;
  walletPublicKey: string;
  applicationIdsPlaintext: NonNullable<
    StellarPreparedOperation["transactArtifacts"]
  >["applicationIdsPlaintext"];
  ciphertextHex?: string;
  outputNoteEphemeralScalars?: string[];
} {
  const artifacts = prepared.transactArtifacts;
  const proofHex = readTrimmedArtifact(artifacts, "proofHex");
  const publicHex = readTrimmedArtifact(artifacts, "publicHex");
  const walletPublicKey = readTrimmedArtifact(artifacts, "walletPublicKey");
  if (!artifacts || !proofHex || !publicHex || !walletPublicKey) {
    throw new Error("Prepared sweep is missing transact artifacts.");
  }
  const ciphertextHex = artifacts.ciphertextHex?.trim();
  const outputNoteEphemeralScalars = artifacts.outputNoteEphemeralScalars;
  return {
    proofHex,
    publicHex,
    walletPublicKey,
    applicationIdsPlaintext: artifacts.applicationIdsPlaintext,
    ...(ciphertextHex ? { ciphertextHex } : {}),
    ...(outputNoteEphemeralScalars
      ? { outputNoteEphemeralScalars: [...outputNoteEphemeralScalars] }
      : {}),
  };
}

async function submitSweepDirect(
  prepared: StellarPreparedOperation,
): Promise<{ operationId: string }> {
  const artifacts = requireSweepSubmitArtifacts(prepared);
  const environment = getPrivacyTransactEnvironment();
  const txId = await submitSorobanConfidentialTransfer({
    contractId: environment.network.poolContract,
    walletPublicKey: artifacts.walletPublicKey,
    proofHex: artifacts.proofHex,
    publicHex: artifacts.publicHex,
    ...(artifacts.applicationIdsPlaintext
      ? { applicationIdsPlaintext: artifacts.applicationIdsPlaintext }
      : {}),
    ...(artifacts.ciphertextHex
      ? { ciphertextHex: artifacts.ciphertextHex }
      : {}),
    ...(artifacts.outputNoteEphemeralScalars
      ? { outputNoteEphemeralScalars: artifacts.outputNoteEphemeralScalars }
      : {}),
    networkPassphrase: environment.network.networkPassphrase,
    sorobanRpcUrl: environment.network.rpcUrl,
    transactEnvironment: environment,
  });
  if (!txId.trim()) {
    throw new Error("Escrow sweep execute did not return a transaction hash.");
  }
  return { operationId: txId };
}

export async function submitEscrowSweep(input: {
  dispatch: AppDispatch;
  walletPublicKey: string;
  prepared: StellarPreparedOperation;
  catalog: readonly EscrowClaimAssetCatalogEntry[];
}): Promise<void> {
  const stamped = stampSweepPersistAsset({
    tokenAddress: String(input.prepared.intent.asset),
    catalog: input.catalog,
    outputRecords: input.prepared.outputRecords,
  });
  const prepared = {
    ...input.prepared,
    outputRecords: stamped.outputRecords,
  };
  await routePreparedTransact({
    ports: bindEscrowSweepRelayPorts({
      dispatch: input.dispatch,
      execute: async () => submitSweepDirect(prepared),
    }),
    walletPublicKey: input.walletPublicKey,
    prepared,
    display: {
      kind: "transfer",
      assetId: stamped.persistAssetId,
      amountDisplay: stroopsToDisplayAmount(prepared.intent.amount),
      counterparty: input.walletPublicKey,
      senderPrivateAddress: input.walletPublicKey,
    },
  });
}
