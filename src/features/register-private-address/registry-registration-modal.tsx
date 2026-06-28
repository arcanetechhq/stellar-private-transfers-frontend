import React from "react";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useRegisterWalletPrivateAddress } from "./use-register-wallet-private-address";

type RegistryRegistrationModalProperties = {
  open: boolean;
  onRegistered: () => void;
};

export function RegistryRegistrationModal({
  open,
  onRegistered,
}: RegistryRegistrationModalProperties) {
  const { t: translate } = useTranslation("privateAddress");
  const { register, status, errorMessage } = useRegisterWalletPrivateAddress();
  const isBusy = status === "creating" || status === "registering";

  if (!open) {
    return;
  }

  const handleRegister = async () => {
    const ok = await register();
    if (ok) {
      onRegistered();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[var(--overlay-backdrop)]">
      <div className="m-4 w-full max-w-md rounded-2xl bg-[var(--surface-card)] p-6 shadow-[var(--shadow-modal)]">
        <h3 className="mb-2 text-lg font-semibold text-[var(--foreground-primary)]">
          {translate("registrationRequiredTitle")}
        </h3>
        <p className="mb-4 text-sm text-[var(--foreground-secondary)]">
          {translate("registrationRequiredDescription")}
        </p>
        {errorMessage ? (
          <p className="mb-3 text-sm text-[var(--error)]" role="alert">
            {errorMessage}
          </p>
        ) : undefined}
        <button
          type="button"
          disabled={isBusy}
          onClick={() => void handleRegister()}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-[var(--primary-foreground)] disabled:opacity-50"
        >
          {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
          {isBusy
            ? translate("registering")
            : translate("registerPrivateAddress")}
        </button>
      </div>
    </div>
  );
}
