import "./registry-registration-modal.css";
import { Loader2, X } from "lucide-react";
import { useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useRegisterWalletPrivateAddress } from "./use-register-wallet-private-address";

type RegistryRegistrationModalProperties = {
  open: boolean;
  onClose: () => void;
  onRegistered: () => void;
};

export function RegistryRegistrationModal({
  open,
  onClose,
  onRegistered,
}: RegistryRegistrationModalProperties) {
  const { t: translate } = useTranslation(["privateAddress", "common"]);
  const { register, reset, status, hasError, errorMessage } =
    useRegisterWalletPrivateAddress();
  const isBusy = status === "creating" || status === "registering";

  const handleClose = useCallback(() => {
    if (isBusy) {
      return;
    }
    reset();
    onClose();
  }, [isBusy, onClose, reset]);

  useEffect(() => {
    if (!open) {
      reset();
      return undefined;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isBusy) {
        handleClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, isBusy, handleClose, reset]);

  if (!open) {
    return;
  }

  const handleRegister = async () => {
    const ok = await register();
    if (ok) {
      reset();
      onRegistered();
    }
  };

  return createPortal(
    <div
      className="registry-registration-modal__backdrop"
      onClick={handleClose}
      role="presentation"
    >
      <div
        className="registry-registration-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="registry-registration-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="registry-registration-modal__header">
          <h3
            id="registry-registration-modal-title"
            className="registry-registration-modal__title"
          >
            {translate("privateAddress:registrationRequiredTitle")}
          </h3>
          <button
            type="button"
            className="registry-registration-modal__close"
            aria-label={translate("common:a11y.close")}
            disabled={isBusy}
            onClick={handleClose}
          >
            <X size={18} strokeWidth={1.7} />
          </button>
        </div>
        <div className="registry-registration-modal__body">
          <p className="registry-registration-modal__description">
            {translate("privateAddress:registrationRequiredDescription")}
          </p>
          {hasError ? (
            <p
              className="registry-registration-modal__error"
              role="alert"
              data-testid="register-private-address-error"
            >
              {errorMessage
                ? `${translate("privateAddress:registrationFailed")}: ${errorMessage}`
                : translate("privateAddress:registrationFailed")}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          data-testid="register-private-address"
          disabled={isBusy}
          onClick={() => void handleRegister()}
          className="registry-registration-modal__submit"
        >
          {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {isBusy
            ? translate("privateAddress:registering")
            : translate("privateAddress:registerPrivateAddress")}
        </button>
      </div>
    </div>,
    document.body,
  );
}
