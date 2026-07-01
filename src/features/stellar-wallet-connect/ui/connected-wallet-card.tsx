import { Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useWalletProviderLabel } from "@/entities/wallet";
import { shortenStellarAddress } from "@/shared/lib/shorten-stellar-address";

type ConnectedWalletCardProperties = {
  publicKey: string;
};

export function ConnectedWalletCard({ publicKey }: ConnectedWalletCardProperties) {
  const { t: translate } = useTranslation("common");
  const providerLabel = useWalletProviderLabel();

  return (
    <div className="stellar-wallet-connected-card">
      <span className="stellar-wallet-connected-card__icon" aria-hidden="true">
        <Wallet size={17} strokeWidth={1.6} />
      </span>
      <span className="stellar-wallet-connected-card__copy">
        <span className="stellar-wallet-connected-card__address">
          {shortenStellarAddress(publicKey, 4, 3)}
        </span>
        <span className="stellar-wallet-connected-card__provider">
          {translate("walletProviderWallet", {
            provider: providerLabel,
          })}
        </span>
      </span>
      <span className="stellar-wallet-connected-card__status">
        <span className="stellar-wallet-connected-card__status-dot" aria-hidden="true" />
        {translate("connected")}
      </span>
    </div>
  );
}
