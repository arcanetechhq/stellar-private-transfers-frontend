import { useEffect, useRef } from "react";
import { Networks } from "@stellar/stellar-sdk";
import { ArrowDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store";
import { useAssetsWithTrustlines } from "@/entities/asset";
import { selectWalletPublicKey } from "@/entities/wallet";
import { STELLAR_NETWORK_PASSPHRASE } from "@/shared/stellar/horizon-server";
import { HeaderFaucetAssetRow } from "./header-faucet-asset-row";

const isTestnet = STELLAR_NETWORK_PASSPHRASE === Networks.TESTNET;

interface HeaderFaucetMenuProperties {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HeaderFaucetMenu({
  isOpen,
  onOpenChange,
}: HeaderFaucetMenuProperties) {
  const { t: translate } = useTranslation("assets");
  const publicKey = useAppSelector(selectWalletPublicKey);
  const { assets } = useAssetsWithTrustlines(publicKey);
  const menuReference = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!menuReference.current?.contains(event.target as Node)) {
        onOpenChange(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onOpenChange]);

  if (!isTestnet) {
    return;
  }

  const sortedAssets = assets.toSorted((left, right) => left.id - right.id);

  return (
    <div className="faucet-menu" ref={menuReference}>
      <button
        type="button"
        className="topbar-action faucet-menu__trigger"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        data-open={isOpen}
        onClick={() => {
          onOpenChange(!isOpen);
        }}
      >
        <ArrowDown size={18} strokeWidth={1.5} />
        <span>{translate("faucet.headerLabel")}</span>
      </button>

      {isOpen ? (
        <div
          className="faucet-menu__popover"
          role="menu"
          aria-label={translate("faucet.menuTitle")}
        >
          <div className="faucet-menu__header">
            <h2 className="faucet-menu__title">{translate("faucet.menuTitle")}</h2>
            <p className="faucet-menu__description">{translate("faucet.menuDescription")}</p>
          </div>
          <div className="faucet-menu__list">
            {sortedAssets.length === 0 ? (
              <p className="faucet-menu__empty">{translate("noAssetsFound")}</p>
            ) : (
              sortedAssets.map((asset) => (
                <HeaderFaucetAssetRow
                  key={asset.id}
                  asset={asset}
                  walletPublicKey={publicKey ?? undefined}
                  showFaucet
                />
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
