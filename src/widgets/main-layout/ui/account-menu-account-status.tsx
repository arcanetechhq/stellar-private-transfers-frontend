import { useTranslation } from "react-i18next";
import {
  useWalletPrivateAddress,
  isWalletRegistryChecking,
  registryStatusLabel,
  registryStatusTone,
} from "@/features/register-private-address";

export function AccountMenuAccountStatus() {
  const { t: translate } = useTranslation("privateAddress");
  const {
    registryStatus,
    isRegistryLoading,
    canOpenRegistryRegistration,
    openRegistryRegistrationModal,
  } = useWalletPrivateAddress();
  const isChecking = isWalletRegistryChecking(
    registryStatus,
    isRegistryLoading,
  );
  const tone = registryStatusTone(registryStatus);

  return (
    <div className="account-menu__section account-menu__status">
      <p className="account-menu__status-label">
        {translate("registryStatusTitle")}
      </p>
      <button
        type="button"
        className="account-menu__status-badge"
        data-tone={tone}
        disabled={!canOpenRegistryRegistration || isChecking}
        onClick={openRegistryRegistrationModal}
      >
        {registryStatusLabel(registryStatus, translate)}
      </button>
    </div>
  );
}
