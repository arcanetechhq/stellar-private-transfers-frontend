import type { StellarPreparedOperation } from "@arcanetech/privacy-sdk-stellar";
import type { AppDispatch } from "@/store";
import { routePreparedTransact } from "@/shared/lib/protocol-relay";
import { stroopsToDisplayAmount } from "@/shared/lib/stellar/stroops.js";
import { bindEscrowSweepRelayPorts } from "./bind-escrow-sweep-ports.js";

export async function submitEscrowSweep(input: {
  dispatch: AppDispatch;
  walletPublicKey: string;
  prepared: StellarPreparedOperation;
  assetId: string;
}): Promise<void> {
  await routePreparedTransact({
    ports: bindEscrowSweepRelayPorts({ dispatch: input.dispatch }),
    walletPublicKey: input.walletPublicKey,
    prepared: input.prepared,
    display: {
      kind: "transfer",
      assetId: input.assetId,
      amountDisplay: stroopsToDisplayAmount(input.prepared.intent.amount),
      counterparty: input.walletPublicKey,
      senderPrivateAddress: input.walletPublicKey,
    },
  });
}
