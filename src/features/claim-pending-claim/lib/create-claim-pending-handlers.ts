import type { AppDispatch } from "@/store";
import {
  parsePendingClaimTransactionId,
  type PendingClaimItem,
} from "@/entities/pending-claims";
import type { RelayActionState } from "@/shared/lib/protocol-relay";
import type { Dispatch, SetStateAction } from "react";
import {
  resumePendingClaim,
  startPendingClaim,
} from "./start-pending-claim.js";

type ClaimPendingState = {
  dispatch: AppDispatch;
  publicKey: string | null;
  actionsEnabled: boolean;
  ensureWalletPrivateAddress: () => Promise<string>;
  ensureWalletScalar: () => Promise<string>;
  onClaimed?: (claimId: number) => void;
  lastClaimId: number | undefined;
  relayAction: RelayActionState | undefined;
  setClaimingId: Dispatch<SetStateAction<number | undefined>>;
  setLastClaimId: Dispatch<SetStateAction<number | undefined>>;
  setClaimError: Dispatch<SetStateAction<string | undefined>>;
  setRelayAction: Dispatch<SetStateAction<RelayActionState | undefined>>;
};

export async function executeClaimPending(input: {
  state: ClaimPendingState;
  claim: PendingClaimItem;
  assetId: string;
}): Promise<void> {
  const trimmedPublicKey = input.state.publicKey?.trim();
  if (!trimmedPublicKey || !input.state.actionsEnabled) {
    return;
  }
  input.state.setClaimError(undefined);
  input.state.setRelayAction(undefined);
  input.state.setClaimingId(input.claim.id);
  input.state.setLastClaimId(input.claim.id);
  const result = await startPendingClaim({
    dispatch: input.state.dispatch,
    walletPublicKey: trimmedPublicKey,
    claim: input.claim,
    assetId: input.assetId,
    ensureWalletPrivateAddress: input.state.ensureWalletPrivateAddress,
    ensureWalletScalar: input.state.ensureWalletScalar,
    onClaimed: input.state.onClaimed,
  });
  input.state.setClaimingId(undefined);
  if (result.error) {
    input.state.setClaimError(result.error);
    input.state.setRelayAction(result.relayAction);
  }
}

export async function executeClaimContinue(input: {
  state: ClaimPendingState;
  action: "retry" | "fallback";
}): Promise<void> {
  const trimmedPublicKey = input.state.publicKey?.trim();
  if (
    !input.state.relayAction ||
    !trimmedPublicKey ||
    input.state.lastClaimId === undefined
  ) {
    return;
  }
  input.state.setClaimingId(input.state.lastClaimId);
  const result = await resumePendingClaim({
    dispatch: input.state.dispatch,
    walletPublicKey: trimmedPublicKey,
    relayAction: input.state.relayAction,
    action: input.action,
    onClaimed: input.state.onClaimed,
    claimId: input.state.lastClaimId,
  });
  input.state.setClaimingId(undefined);
  if (result.error) {
    input.state.setClaimError(result.error);
    input.state.setRelayAction(result.relayAction);
  }
}

export function executeClaimByTransactionId(input: {
  state: ClaimPendingState;
  transactionId: string;
  claimsById: ReadonlyMap<number, PendingClaimItem>;
  assetIdsByClaimId: ReadonlyMap<number, string>;
}): void {
  const pendingClaimId = parsePendingClaimTransactionId(input.transactionId);
  if (pendingClaimId === undefined) {
    return;
  }
  const claim = input.claimsById.get(pendingClaimId);
  const assetId = input.assetIdsByClaimId.get(pendingClaimId);
  if (!claim || !assetId) {
    return;
  }
  void executeClaimPending({ state: input.state, claim, assetId });
}

export function createClaimPendingHandlers(state: ClaimPendingState) {
  return {
    claimPending: (claimInput: { claim: PendingClaimItem; assetId: string }) =>
      executeClaimPending({ state, ...claimInput }),
    continueClaim: (action: "retry" | "fallback") =>
      executeClaimContinue({ state, action }),
    claimByTransactionId: (lookup: {
      transactionId: string;
      claimsById: ReadonlyMap<number, PendingClaimItem>;
      assetIdsByClaimId: ReadonlyMap<number, string>;
    }) => executeClaimByTransactionId({ state, ...lookup }),
  };
}
