import { useCallback, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import type { AssetWithTrustline } from "@/entities/asset";
import {
  parsePendingClaimTransactionId,
  type PendingClaimItem,
} from "@/entities/pending-claims";
import { selectWalletPublicKey } from "@/entities/wallet";
import { useWalletPrivateAddress } from "@/features/register-private-address";
import {
  readPendingClaimMutationError,
  runPendingClaimMutation,
} from "../lib/run-pending-claim-mutation.js";

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
  const [claimError, setClaimError] = useState<string | undefined>();

  const claimPending = useCallback(
    async (input: {
      claim: PendingClaimItem;
      assetId: string;
      asset: AssetWithTrustline | undefined;
    }) => {
      const trimmedPublicKey = publicKey?.trim();
      if (!trimmedPublicKey || !actionsEnabled) {
        return;
      }
      setClaimError(undefined);
      setClaimingId(input.claim.id);
      try {
        const permanentPrivateAddress = await ensureWalletPrivateAddress();
        await ensureWalletScalar();
        await runPendingClaimMutation({
          dispatch,
          publicKey: trimmedPublicKey,
          claim: input.claim,
          assetId: input.assetId,
          asset: input.asset,
          permanentPrivateAddress,
        });
        onClaimed?.(input.claim.id);
      } catch (error: unknown) {
        setClaimError(readPendingClaimMutationError(error));
      } finally {
        setClaimingId(undefined);
      }
    },
    [
      actionsEnabled,
      dispatch,
      ensureWalletPrivateAddress,
      ensureWalletScalar,
      onClaimed,
      publicKey,
    ],
  );

  const claimByTransactionId = useCallback(
    (
      transactionId: string,
      claimsById: ReadonlyMap<number, PendingClaimItem>,
      assetsById: ReadonlyMap<string, AssetWithTrustline>,
      assetIdsByClaimId: ReadonlyMap<number, string>,
    ) => {
      const pendingClaimId = parsePendingClaimTransactionId(transactionId);
      if (pendingClaimId === undefined) {
        return;
      }
      const claim = claimsById.get(pendingClaimId);
      const assetId = assetIdsByClaimId.get(pendingClaimId);
      if (!claim || !assetId) {
        return;
      }
      void claimPending({
        claim,
        assetId,
        asset: assetsById.get(assetId),
      });
    },
    [claimPending],
  );

  return {
    claimPending,
    claimByTransactionId,
    claimingId,
    claimError,
    setClaimError,
    canClaim: actionsEnabled,
  };
}
