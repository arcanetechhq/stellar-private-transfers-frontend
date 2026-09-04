import { fetchEscrowOutputNoteEvents } from "@arcanetech/privacy-sdk-stellar/transact";
import type { EscrowIndexNote } from "@/entities/escrow-index";
import type { AppDispatch } from "@/store";
import { getPrivacyTransactEnvironment } from "@/shared/lib/privacy-sdk/transact-context.js";
import { claimEscrowNote } from "./claim-escrow-note.js";
import type { EscrowClaimAssetCatalogEntry } from "./pending-escrow-asset-claims.js";
import { submitEscrowSweep } from "./submit-escrow-sweep.js";

export async function runEscrowSweepClaim(input: {
  dispatch: AppDispatch;
  note: EscrowIndexNote;
  walletPublicKey: string;
  registeredPrivateAddress: string;
  catalog: readonly EscrowClaimAssetCatalogEntry[];
}): Promise<void> {
  await claimEscrowNote({
    note: input.note,
    walletPublicKey: input.walletPublicKey,
    registeredPrivateAddress: input.registeredPrivateAddress,
    ports: {
      fetchOutputNoteEvents: async ({ txId, poolAddress }) =>
        fetchEscrowOutputNoteEvents({
          transactEnvironment: getPrivacyTransactEnvironment(),
          txId,
          poolAddress,
        }),
      submitSweep: async ({ prepared }) => {
        await submitEscrowSweep({
          dispatch: input.dispatch,
          walletPublicKey: input.walletPublicKey,
          prepared,
          catalog: input.catalog,
        });
      },
    },
  });
}
