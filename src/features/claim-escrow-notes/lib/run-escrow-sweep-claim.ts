import {
  fetchEscrowOutputNoteEvents,
  unsignedEscrowAuthorizationForSweep,
} from "@arcanetech/privacy-sdk-stellar/transact";
import type { EscrowIndexNote } from "@/entities/escrow-index";
import type { AppDispatch } from "@/store";
import { readClientEnvironment } from "@/shared/lib/privacy-sdk/read-client-environment.js";
import { getPrivacyTransactEnvironment } from "@/shared/lib/privacy-sdk/transact-context.js";
import { claimEscrowNote } from "./claim-escrow-note.js";
import { submitEscrowSweep } from "./submit-escrow-sweep.js";

function readRelayerPublicKey(): string {
  const value = readClientEnvironment("VITE_RELAYER_PUBLIC_KEY")?.trim();
  if (!value) {
    throw new Error("Missing VITE_RELAYER_PUBLIC_KEY environment variable");
  }
  return value;
}

export async function runEscrowSweepClaim(input: {
  dispatch: AppDispatch;
  note: EscrowIndexNote;
  walletPublicKey: string;
  registeredPrivateAddress: string;
}): Promise<void> {
  await claimEscrowNote({
    note: input.note,
    walletPublicKey: input.walletPublicKey,
    registeredPrivateAddress: input.registeredPrivateAddress,
    ports: {
      fetchOutputNoteEvents: async ({ txId, poolAddress }) =>
        fetchEscrowOutputNoteEvents({
          rpcUrl: getPrivacyTransactEnvironment().network.rpcUrl,
          txId,
          poolAddress,
        }),
      unsignedAuthEntryXdr: async ({ prepared }) =>
        unsignedEscrowAuthorizationForSweep({
          prepared,
          transactEnvironment: getPrivacyTransactEnvironment(),
          relayerPublicKey: readRelayerPublicKey(),
        }),
      submitSweep: async ({ prepared }) => {
        await submitEscrowSweep({
          dispatch: input.dispatch,
          walletPublicKey: input.walletPublicKey,
          prepared,
          assetId: prepared.intent.asset,
        });
      },
    },
  });
}
