import { useTranslation } from "react-i18next";
import type { StellarWalletModalMode } from "../lib/wallet-modal-mode";
import { ConnectedWalletManageContent } from "./connected-wallet-manage-content";
import { StellarWalletModalShell } from "./stellar-wallet-modal-shell";
import { WalletConnectPickerContent } from "./wallet-connect-picker-content";

export type { StellarWalletModalMode } from "../lib/wallet-modal-mode";

type StellarWalletModalProperties = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: StellarWalletModalMode;
  publicKey?: string;
  isChangeWallet?: boolean;
  onDisconnect?: () => void | Promise<void>;
};

export function StellarWalletModal({
  open,
  onOpenChange,
  mode,
  publicKey,
  isChangeWallet = false,
  onDisconnect,
}: StellarWalletModalProperties) {
  const { t: translate } = useTranslation("common");

  const closeModal = () => {
    onOpenChange(false);
  };

  const handleDisconnect = async () => {
    closeModal();
    await onDisconnect?.();
  };

  if (mode === "connected" && publicKey) {
    return (
      <StellarWalletModalShell
        open={open}
        onOpenChange={onOpenChange}
        title={translate("connectedWalletModalTitle")}
        description={translate("connectedWalletModalDescription")}
        ariaLabel={translate("connectedWalletModalTitle")}
        footer={
          <>
            <button
              type="button"
              className="stellar-wallet-modal__footer-button stellar-wallet-modal__footer-button--secondary"
              onClick={closeModal}
            >
              {translate("a11y.close")}
            </button>
            <button
              type="button"
              className="stellar-wallet-modal__footer-button stellar-wallet-modal__footer-button--disconnect"
              onClick={() => {
                void handleDisconnect();
              }}
            >
              {translate("disconnect")}
            </button>
          </>
        }
      >
        <ConnectedWalletManageContent publicKey={publicKey} />
      </StellarWalletModalShell>
    );
  }

  return (
    <StellarWalletModalShell
      open={open}
      onOpenChange={onOpenChange}
      title={translate(
        isChangeWallet ? "changeWalletModalTitle" : "connectWalletModalTitle",
      )}
      description={translate(
        isChangeWallet
          ? "changeWalletModalDescription"
          : "connectWalletModalDescription",
      )}
      ariaLabel={translate(
        isChangeWallet ? "changeWalletModalTitle" : "connectWalletModalTitle",
      )}
    >
      <WalletConnectPickerContent
        open={open}
        isChangeWallet={isChangeWallet}
        onConnected={closeModal}
      />
    </StellarWalletModalShell>
  );
}
