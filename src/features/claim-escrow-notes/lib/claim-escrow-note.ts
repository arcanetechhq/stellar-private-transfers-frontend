import {
  assertEscrowSweepClaimant,
  attachEscrowAuthorization,
  finalizeSpendOperationAtExecute,
  prepareEscrowSweepOperation,
  reconstructEscrowNote,
  type EscrowOutputNoteCiphertextEvent,
} from "@arcanetech/privacy-sdk-stellar/transact";
import type { StellarPreparedOperation } from "@arcanetech/privacy-sdk-stellar";
import type { EscrowIndexNote } from "@/entities/escrow-index";
import {
  getConfiguredPrivacyPoolService,
  getPrivacyTransactEnvironment,
} from "@/shared/lib/privacy-sdk/transact-context.js";
import { signEscrowAuthEntry } from "./sign-escrow-auth-entry.js";

export type ClaimEscrowNotePorts = {
  fetchOutputNoteEvents: (input: {
    txId: string;
    poolAddress: string;
  }) => Promise<EscrowOutputNoteCiphertextEvent[]>;
  unsignedAuthEntryXdr: (input: {
    note: EscrowIndexNote;
    prepared: StellarPreparedOperation;
  }) => Promise<string>;
  submitSweep: (input: {
    prepared: ReturnType<typeof prepareEscrowSweepOperation>;
  }) => Promise<void>;
  signAuthEntry?: typeof signEscrowAuthEntry;
};

async function proveAndAuthorize(input: {
  prepared: ReturnType<typeof prepareEscrowSweepOperation>;
  note: EscrowIndexNote;
  walletPublicKey: string;
  ports: ClaimEscrowNotePorts;
}) {
  const proved = await finalizeSpendOperationAtExecute(
    input.prepared,
    getPrivacyTransactEnvironment(),
    getConfiguredPrivacyPoolService(),
  );
  const signAuth = input.ports.signAuthEntry ?? signEscrowAuthEntry;
  const signedAuth = await signAuth({
    authEntryXdr: await input.ports.unsignedAuthEntryXdr({
      note: input.note,
      prepared: proved,
    }),
    address: input.walletPublicKey,
  });
  return attachEscrowAuthorization(proved, signedAuth);
}

export async function claimEscrowNote(input: {
  note: EscrowIndexNote;
  walletPublicKey: string;
  registeredPrivateAddress: string;
  ports: ClaimEscrowNotePorts;
}): Promise<void> {
  assertEscrowSweepClaimant({
    walletPublicKey: input.walletPublicKey,
    claimantAddress: input.walletPublicKey,
  });
  const reconstructed = await reconstructEscrowNote({
    claimantAddress: input.walletPublicKey,
    nonceDecimal: input.note.escrowNonce,
    seq: input.note.seq,
    events: await input.ports.fetchOutputNoteEvents({
      txId: input.note.txId,
      poolAddress: input.note.poolAddress,
    }),
  });
  const prepared = prepareEscrowSweepOperation({
    walletPublicKey: input.walletPublicKey,
    claimantAddress: input.walletPublicKey,
    registeredPrivateAddress: input.registeredPrivateAddress,
    reconstructed,
    poolContract: input.note.poolAddress,
    asset: reconstructed.tokenAddress,
  });
  const authorized = await proveAndAuthorize({
    prepared,
    note: input.note,
    walletPublicKey: input.walletPublicKey,
    ports: input.ports,
  });
  await input.ports.submitSweep({ prepared: authorized });
}
