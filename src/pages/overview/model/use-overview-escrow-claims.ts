import { useAppSelector } from "@/store";
import { selectWalletPublicKey } from "@/entities/wallet";
import { useClaimEscrowNotes } from "@/features/claim-escrow-notes";
import { useDiscoverEscrowNotes } from "@/features/discover-escrow-notes";
import { useWalletPrivateAddress } from "@/features/register-private-address";

export function useOverviewEscrowClaims() {
  const publicKey = useAppSelector(selectWalletPublicKey);
  const { actionsEnabled, ensureWalletPrivateAddress, ensureWalletScalar } =
    useWalletPrivateAddress();
  const { notes } = useDiscoverEscrowNotes(publicKey);
  return useClaimEscrowNotes({
    notes,
    walletPublicKey: publicKey,
    ensureWalletPrivateAddress,
    ensureWalletScalar,
    canClaim: actionsEnabled,
  });
}
