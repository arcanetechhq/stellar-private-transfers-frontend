import {
  fetchEscrowOutputNoteEvents,
  reconstructEscrowNote,
} from "@arcanetech/privacy-sdk-stellar/transact";
import type { EscrowIndexNote } from "@/entities/escrow-index";
import { getPrivacyTransactEnvironment } from "@/shared/lib/privacy-sdk/transact-context.js";
import { stroopsToDisplayAmount } from "@/shared/lib/stellar/stroops.js";

export async function previewEscrowNoteDisplay(input: {
  note: EscrowIndexNote;
  walletPublicKey: string;
}): Promise<{ tokenAddress: string; amountDisplay: number }> {
  const reconstructed = await reconstructEscrowNote({
    claimantAddress: input.walletPublicKey,
    nonceDecimal: input.note.escrowNonce,
    seq: input.note.seq,
    events: await fetchEscrowOutputNoteEvents({
      transactEnvironment: getPrivacyTransactEnvironment(),
      txId: input.note.txId,
      poolAddress: input.note.poolAddress,
    }),
  });
  return {
    tokenAddress: reconstructed.tokenAddress,
    amountDisplay: stroopsToDisplayAmount(BigInt(reconstructed.coin.value)),
  };
}
