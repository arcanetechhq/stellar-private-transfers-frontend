import type { AppDispatch } from "@/store";
import type { PendingClaimItem } from "@/entities/pending-claims";
import {
  readRelayAction,
  type RelayActionState,
} from "@/shared/lib/protocol-relay";
import { continuePendingClaimRelay } from "./continue-pending-claim-relay.js";
import {
  readPendingClaimMutationError,
  runPendingClaimMutation,
} from "./run-pending-claim-mutation.js";

export async function startPendingClaim(input: {
  dispatch: AppDispatch;
  walletPublicKey: string;
  claim: PendingClaimItem;
  assetId: string;
  ensureWalletPrivateAddress: () => Promise<string>;
  ensureWalletScalar: () => Promise<string>;
  onClaimed?: (claimId: number) => void;
}): Promise<{ error?: string; relayAction?: RelayActionState }> {
  try {
    const permanentPrivateAddress = await input.ensureWalletPrivateAddress();
    await input.ensureWalletScalar();
    await runPendingClaimMutation({
      dispatch: input.dispatch,
      claim: input.claim,
      assetId: input.assetId,
      permanentPrivateAddress,
      walletPublicKey: input.walletPublicKey,
    });
    input.onClaimed?.(input.claim.id);
    return {};
  } catch (error: unknown) {
    return {
      error: readPendingClaimMutationError(error),
      relayAction: readRelayAction(error),
    };
  }
}

export async function resumePendingClaim(input: {
  dispatch: AppDispatch;
  walletPublicKey: string;
  relayAction: RelayActionState;
  action: "retry" | "fallback";
  claimId: number;
  onClaimed?: (claimId: number) => void;
}): Promise<{ error?: string; relayAction?: RelayActionState }> {
  return continuePendingClaimRelay(input);
}
