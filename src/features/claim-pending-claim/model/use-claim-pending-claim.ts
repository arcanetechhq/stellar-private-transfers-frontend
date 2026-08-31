import { useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { selectWalletPublicKey } from "@/entities/wallet";
import { useWalletPrivateAddress } from "@/features/register-private-address";
import type { RelayActionState } from "@/shared/lib/protocol-relay";
import { createClaimPendingHandlers } from "../lib/create-claim-pending-handlers.js";

export function useClaimPendingClaim(parameters?: {
  onClaimed?: (claimId: number) => void;
}) {
  const onClaimed = parameters?.onClaimed;
  const dispatch = useAppDispatch();
  const publicKey = useAppSelector(selectWalletPublicKey);
  const {
    actionsEnabled,
    ensureWalletPrivateAddress,
    ensureWalletScalar,
  } = useWalletPrivateAddress();
  const [claimingId, setClaimingId] = useState<number | undefined>();
  const [lastClaimId, setLastClaimId] = useState<number | undefined>();
  const [claimError, setClaimError] = useState<string | undefined>();
  const [relayAction, setRelayAction] = useState<RelayActionState>();
  const handlers = useMemo(
    () =>
      createClaimPendingHandlers({
        dispatch,
        publicKey,
        actionsEnabled,
        ensureWalletPrivateAddress,
        ensureWalletScalar,
        onClaimed,
        lastClaimId,
        relayAction,
        setClaimingId,
        setLastClaimId,
        setClaimError,
        setRelayAction,
      }),
    [
      actionsEnabled,
      dispatch,
      ensureWalletPrivateAddress,
      ensureWalletScalar,
      lastClaimId,
      onClaimed,
      publicKey,
      relayAction,
    ],
  );
  return {
    claimPending: handlers.claimPending,
    claimByTransactionId: handlers.claimByTransactionId,
    claimingId,
    claimError,
    setClaimError,
    canClaim: actionsEnabled,
    relayAction,
    handleRetry: () => {
      handlers.continueClaim("retry").catch(() => {
        return;
      });
    },
    handleFallback: () => {
      handlers.continueClaim("fallback").catch(() => {
        return;
      });
    },
  };
}
