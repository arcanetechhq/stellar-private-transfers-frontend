import { ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export function WalletInstallBadge() {
  const { t: translate } = useTranslation("common");

  return (
    <span className="stellar-wallet-install-badge">
      {translate("walletInstall")}
      <ArrowUpRight size={14} strokeWidth={1.8} aria-hidden="true" />
    </span>
  );
}
