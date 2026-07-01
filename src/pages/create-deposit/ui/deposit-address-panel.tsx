import React from "react";
import { Copy, RefreshCw, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCopy } from "@/shared/hooks";
import type { DepositNetworkOption } from "../lib/deposit-mock-data";
import { DepositActivityLoader } from "./deposit-activity-loader";
import { DepositQrCode } from "./deposit-qr-code";

interface DepositAddressPanelProperties {
  selectedNetwork: DepositNetworkOption;
  currentAddress: string;
  showAddressLoading: boolean;
  showPrivateAddressEmpty: boolean;
  canRotateAddress: boolean;
  isPrivateAddressMode: boolean;
  onGeneratePrivateAddress: () => void;
  onGenerateNewAddress: () => void;
}

export function DepositAddressPanel({
  selectedNetwork,
  currentAddress,
  showAddressLoading,
  showPrivateAddressEmpty,
  canRotateAddress,
  isPrivateAddressMode,
  onGeneratePrivateAddress,
  onGenerateNewAddress,
}: DepositAddressPanelProperties): React.JSX.Element {
  const { t: translate } = useTranslation("deposit");
  const { handleCopy } = useCopy(currentAddress);

  function handleCopyAddress() {
    if (showAddressLoading || !currentAddress) {
      return;
    }
    void handleCopy();
  }

  return (
    <div className="deposit-card">
      {showPrivateAddressEmpty ? (
        <div className="deposit-card__empty-address">
          <div className="deposit-card__empty-address-panel">
            <span className="deposit-card__empty-address-icon" aria-hidden="true">
              <ShieldCheck size={28} strokeWidth={1.7} />
            </span>
            <span className="deposit-card__empty-address-copy">
              <p className="deposit-card__empty-address-title">
                {translate("generatePrivateAddressTitle")}
              </p>
              <p className="deposit-card__empty-address-description">
                {translate("generatePrivateAddressDescription")}
              </p>
            </span>
            <button
              type="button"
              className="deposit-generate-button"
              onClick={onGeneratePrivateAddress}
            >
              {translate("generate")}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div
            className="deposit-card__qr-box"
            data-loading={showAddressLoading ? "true" : undefined}
          >
            {showAddressLoading ? (
              <div className="deposit-card__loader">
                <DepositActivityLoader label={translate("generatingAddress")} />
                <span>{translate("generatingAddress")}</span>
              </div>
            ) : (
              <DepositQrCode
                value={`${selectedNetwork.id}:${currentAddress}`}
              />
            )}
          </div>
          <p className="deposit-card__note">
            {isPrivateAddressMode ? (
              <>
                {translate("receiveOnly")}
                <br />
                <strong>
                  {translate("receiveOnlyPrivate", {
                    network: selectedNetwork.label,
                  })}
                </strong>
              </>
            ) : (
              <>
                {translate("sendOnly")}
                <br />
                <strong>
                  {translate("sendOnlyNetwork", {
                    network: selectedNetwork.label,
                  })}
                </strong>
              </>
            )}
          </p>
          <div className="deposit-address-card">
            <div className="deposit-address-card__copy">
              <p className="deposit-address-card__label">
                {isPrivateAddressMode
                  ? translate("privateAddressLabel")
                  : translate("publicAddressLabel")}
              </p>
              <p className="deposit-address-card__value">
                {showAddressLoading ? (
                  <span className="deposit-address-card__loader">
                    <DepositActivityLoader label={translate("generatingAddress")} />
                    <span>{translate("generatingAddress")}</span>
                  </span>
                ) : (
                  currentAddress
                )}
              </p>
            </div>
            <div
              className={`deposit-address-card__actions${
                canRotateAddress ? "" : " deposit-address-card__actions--single"
              }`}
            >
              {canRotateAddress ? (
                <button
                  type="button"
                  className="deposit-new-address-button"
                  aria-label={translate("generateNewAddress")}
                  title={translate("generateNewAddress")}
                  disabled={showAddressLoading}
                  data-loading={showAddressLoading ? "true" : undefined}
                  onClick={onGenerateNewAddress}
                >
                  <RefreshCw size={18} strokeWidth={1.8} />
                </button>
              ) : null}
              <button
                type="button"
                className="deposit-copy-button"
                disabled={showAddressLoading}
                onClick={handleCopyAddress}
              >
                <Copy size={20} strokeWidth={1.8} />
                <span>{translate("copy")}</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
