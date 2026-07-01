import { Check, Copy, Loader2Icon } from "lucide-react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store";
import { DEFAULT_PRIVATE_ADDRESS_SIGN_NONCE } from "@/features/create-private-address";
import {
  selectDefaultNonce,
  selectPrivateAddressByNonce,
} from "@/entities/private-address";
import {
  useRegisterWalletPrivateAddress,
  useWalletPrivateAddress,
} from "@/features/register-private-address";
import { shortenStellarAddress } from "@/shared/lib/shorten-stellar-address";
import { useCopy } from "@/shared/hooks";

export function WalletModalPrivateAddressCard() {
  const { t: translate } = useTranslation(["privateAddress", "common"]);
  const { registryStatus, refreshRegistryStatus } = useWalletPrivateAddress();
  const { register, status, errorMessage } = useRegisterWalletPrivateAddress();
  const defaultNonce =
    useAppSelector(selectDefaultNonce) ?? DEFAULT_PRIVATE_ADDRESS_SIGN_NONCE;
  const privateAddressEntry = useAppSelector(
    selectPrivateAddressByNonce(defaultNonce),
  );
  const privateAddress = privateAddressEntry?.privateAddress?.trim() ?? "";
  const privateAddressBeforeAttemptReference = useRef(privateAddress);
  const isError = status === "error";
  const displayedPrivateAddress = isError
    ? privateAddressBeforeAttemptReference.current
    : privateAddress;
  const { copied, handleCopy } = useCopy(displayedPrivateAddress);
  const isCreating = status === "creating";
  const isRegistering = status === "registering";
  const isBusy = isCreating || isRegistering;
  const isRegistered = registryStatus === "active";
  const needsRegistration =
    registryStatus === "unregistered" || registryStatus === "lookup_failed";
  const hasPrivateAddress = Boolean(displayedPrivateAddress);
  const showReadyState = hasPrivateAddress && isRegistered;

  const handleRegister = async () => {
    privateAddressBeforeAttemptReference.current = privateAddress;
    const ok = await register();
    if (ok) {
      await refreshRegistryStatus();
    }
  };

  const actionLabel = (() => {
    if (isCreating) {
      return translate("privateAddress:generating");
    }
    if (isRegistering) {
      return translate("privateAddress:registering");
    }
    if (hasPrivateAddress && needsRegistration) {
      return translate("privateAddress:registerPrivateAddress");
    }
    return translate("privateAddress:generate");
  })();

  return (
    <div
      className="stellar-private-address-card"
      data-generated={showReadyState ? "true" : undefined}
    >
      <div className="stellar-private-address-card__header">
        <span className="stellar-private-address-card__copy">
          <span className="stellar-private-address-card__title">
            {translate("privateAddress:title")}
          </span>
          <span className="stellar-private-address-card__description">
            {showReadyState
              ? translate("privateAddress:modalReadyHint")
              : translate("privateAddress:modalGenerateHint")}
          </span>
        </span>
        {/* {showReadyState || needsRegistration ? (
          <span
            className={`stellar-private-address-card__status${
              needsRegistration && !showReadyState
                ? " stellar-private-address-card__status--warning"
                : ""
            }`}
          >
            <span
              className="stellar-private-address-card__status-dot"
              aria-hidden="true"
            />
            {statusLabel}
          </span>
        ) : null} */}
      </div>

      {hasPrivateAddress ? (
        <div className="stellar-private-address-card__address">
          <span>
            <span className="stellar-private-address-card__address-label">
              {translate("privateAddress:addressLabel")}
            </span>
            <span className="stellar-private-address-card__address-value">
              {shortenStellarAddress(displayedPrivateAddress)}
            </span>
          </span>
          <button
            type="button"
            aria-label={translate("common:a11y.copyAddress")}
            onClick={handleCopy}
          >
            {copied ? (
              <Check size={18} strokeWidth={1.7} />
            ) : (
              <Copy size={18} strokeWidth={1.7} />
            )}
          </button>
        </div>
      ) : null}

      {showReadyState ? null : (
        <>
          <div className="stellar-private-address-card__empty">
            <span className="stellar-private-address-card__empty-title">
              {hasPrivateAddress
                ? translate("privateAddress:registrationRequiredTitle")
                : translate("privateAddress:modalEmptyTitle")}
            </span>
            <span className="stellar-private-address-card__empty-description">
              {hasPrivateAddress
                ? translate("privateAddress:registrationRequiredDescription")
                : translate("privateAddress:modalEmptyDescription")}
            </span>
          </div>
          {errorMessage ? (
            <p className="stellar-private-address-card__error" role="alert">
              {errorMessage}
            </p>
          ) : null}
          <button
            type="button"
            className="stellar-private-address-card__action-button"
            disabled={isBusy}
            onClick={() => {
              void handleRegister();
            }}
          >
            {isBusy ? (
              <>
                <Loader2Icon size={32} strokeWidth={1.7} className="animate-spin" />
                {/* <span>{actionLabel}</span> */}
              </>
            ) : (
              actionLabel
            )}
          </button>
        </>
      )}
    </div>
  );
}
