import { useWalletPrivateAddress } from "@/features/register-private-address";

export function useWithdrawalSender() {
  const { privateAddressStpl1, defaultNonce } = useWalletPrivateAddress();
  return {
    effectiveSenderNonce: defaultNonce,
    senderPrivateAddress: privateAddressStpl1,
  };
}
