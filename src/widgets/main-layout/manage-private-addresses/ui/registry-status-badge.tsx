import { useTranslation } from "react-i18next";
import {
  useWalletPrivateAddress,
  type WalletRegistryStatus,
} from "@/features/register-private-address";
import { useStellarWalletModal } from "@/features/stellar-wallet-connect";

function registryStatusLabel(
  status: WalletRegistryStatus,
  translate: (key: string) => string,
): string {
  if (status === "active") {
    return translate("registryStatusActive");
  }
  if (status === "unregistered") {
    return translate("registryStatusUnregistered");
  }
  if (status === "lookup_failed") {
    return translate("registryStatusLookupFailed");
  }
  return translate("registryStatusUnknown");
}

function registryStatusToneClass(status: WalletRegistryStatus): string {
  if (status === "active") {
    return "bg-[var(--success-bg)] text-[var(--success-foreground)] border-[var(--success-border)]";
  }
  if (status === "unregistered") {
    return "bg-[var(--warning-bg)] text-[var(--warning-foreground)] border-[var(--warning-border)]";
  }
  return "bg-[var(--surface-subtle)] text-[var(--foreground-secondary)] border-[var(--border-soft)]";
}

export function RegistryStatusBadge() {
  const { t: translate } = useTranslation("privateAddress");
  const { registryStatus, isRegistryLoading } = useWalletPrivateAddress();
  const { openConnected } = useStellarWalletModal();

  return (
    <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3">
      <p className="text-xs font-medium text-gray-500">
        {translate("registryStatusTitle")}
      </p>
      <button
        type="button"
        className={`inline-flex shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${registryStatusToneClass(registryStatus)}`}
        onClick={() => {
          if (registryStatus === "unregistered") {
            openConnected();
          }
        }}
      >
        {isRegistryLoading || registryStatus === "checking"
          ? translate("registryStatusUnknown")
          : registryStatusLabel(registryStatus, translate)}
      </button>
    </div>
  );
}
