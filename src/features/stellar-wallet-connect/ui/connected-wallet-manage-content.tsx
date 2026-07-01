import { ConnectedWalletCard } from "./connected-wallet-card";
import { WalletModalPrivateAddressCard } from "./wallet-modal-private-address-card";

type ConnectedWalletManageContentProperties = {
  publicKey: string;
};

export function ConnectedWalletManageContent({
  publicKey,
}: ConnectedWalletManageContentProperties) {
  return (
    <>
      <ConnectedWalletCard publicKey={publicKey} />
      <WalletModalPrivateAddressCard />
    </>
  );
}
