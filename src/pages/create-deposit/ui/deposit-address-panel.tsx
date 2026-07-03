import React from "react";
import { Copy } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCopy } from "@/shared/hooks";
import type { DepositNetworkOption } from "../lib/deposit-mock-data";
import { DepositQrCode } from "./deposit-qr-code";
import { shortenStellarAddress } from "@/shared/lib/shorten-stellar-address";

interface DepositAddressPanelProperties {
  selectedNetwork: DepositNetworkOption;
  publicAddress: string;
  transferLink: string;
}

export function DepositAddressPanel({
  selectedNetwork,
  publicAddress,
  transferLink,
}: DepositAddressPanelProperties): React.JSX.Element {
  const { t: translate } = useTranslation("deposit");
  const { handleCopy: handleCopyAddress, copied: addressCopied } =
    useCopy(publicAddress);
  const { handleCopy: handleCopyLink, copied: linkCopied } =
    useCopy(transferLink);

  function handleCopyAddressClick() {
    if (!publicAddress) {
      return;
    }
    void handleCopyAddress();
  }

  function handleCopyLinkClick() {
    if (!transferLink) {
      return;
    }
    void handleCopyLink();
  }

  return (
    <div className="deposit-card">
      <div className="deposit-card__qr-box">
        <DepositQrCode value={transferLink} />
      </div>
      <p className="deposit-card__note">
        {translate("receiveQrHint")}
        <br />
        <strong>
          {translate("receiveOnlyPrivate", {
            network: selectedNetwork.label,
          })}
        </strong>
      </p>
      <div className="deposit-address-card">
        <div className="deposit-address-card__copy">
          <p className="deposit-address-card__label">
            {translate("publicAddressLabel")}
          </p>
          <p className="deposit-address-card__value">{shortenStellarAddress(publicAddress, 8, 5)}</p>
        </div>
        <div className="deposit-address-card__actions">
          <button
            type="button"
            className="deposit-copy-button"
            disabled={!publicAddress}
            onClick={handleCopyAddressClick}
          >
            <Copy size={20} strokeWidth={1.8} />
            <span>
              {addressCopied ? translate("copied") : translate("copyAddress")}
            </span>
          </button>
          <button
            type="button"
            className="deposit-copy-button"
            disabled={!transferLink}
            onClick={handleCopyLinkClick}
          >
            <Copy size={20} strokeWidth={1.8} />
            <span>
              {linkCopied ? translate("copied") : translate("copyLink")}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
