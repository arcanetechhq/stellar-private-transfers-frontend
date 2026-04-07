import React from "react";
import { Droplets } from "lucide-react";
import { Networks } from "@stellar/stellar-sdk";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/app/hooks";
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

  if (!isTestnet) {
    return;
  }

  const sortedAssets = assets.toSorted((left, right) => left.id - right.id);

  return (
    <div className="relative">
      <button
        type="button"
        className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 transition-colors hover:bg-gray-50"
        aria-expanded={isOpen}
        onClick={() => {
          onOpenChange(!isOpen);
        }}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50">
          <Droplets className="h-4 w-4 text-gray-900" />
        </div>
        <span className="hidden text-[13px] leading-[18px] font-semibold text-gray-900 sm:inline">
          {translate("faucet.headerLabel")}
        </span>
      </button>

      {isOpen ? (
        <React.Fragment>
          <div
            className="fixed inset-0 z-10"
            aria-hidden
            onClick={() => {
              onOpenChange(false);
            }}
          />
          <div
            className="absolute top-full right-0 z-20 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-dropdown)]"
          >
            <div className="border-b border-[var(--border-soft)] px-3 py-2.5 text-sm font-medium text-[var(--foreground-primary)]">
              {translate("faucet.menuTitle")}
            </div>
            <div className="max-h-80 overflow-y-auto px-3 pb-2">
              {sortedAssets.length === 0 ? (
                <p className="py-4 text-center text-sm text-[var(--foreground-secondary)]">
                  {translate("noAssetsFound")}
                </p>
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
        </React.Fragment>
      ) : undefined}
    </div>
  );
}
