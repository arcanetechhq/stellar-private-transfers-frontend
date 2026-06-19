import { useWalletPrivateAddress } from "@/features/register-private-address";

export function useWithdrawalSender() {
  const { privateAddressStpl1, defaultNonce, ensureWalletScalar } =
    useWalletPrivateAddress();
  return {
    effectiveSenderNonce: defaultNonce,
    senderPrivateAddress: privateAddressStpl1,
    ensureSenderScalar: ensureWalletScalar,
  };
}
