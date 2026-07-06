import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ISupportedWallet } from "@creit-tech/stellar-wallets-kit/types";
import { useAppDispatch } from "@/store";
import { useWalletPrivateAddress } from "@/features/register-private-address";
import { connectStellarWalletModule } from "../model/stellar-wallet-thunks";
import { useStellarWalletModal } from "../model/stellar-wallet-modal-context";
import {
  buildSupportedWalletMap,
  fetchSupportedStellarWallets,
  listAdditionalSupportedWallets,
} from "../lib/fetch-supported-stellar-wallets";
import {
  WALLET_CONNECT_OPTIONS,
  type WalletConnectOption,
} from "../lib/wallet-options";
import { WalletConnectAllWalletsContent } from "./wallet-connect-all-wallets-content";
import { WalletPickerOptionButton } from "./wallet-picker-option-button";

type WalletPickerView = "recommended" | "all-wallets";

type WalletConnectPickerContentProperties = {
  open: boolean;
  isChangeWallet: boolean;
  onConnected: () => void;
};

function openWalletProductUrl(url: string) {
  globalThis.open(url, "_blank", "noopener,noreferrer");
}

export function WalletConnectPickerContent({
  open,
  isChangeWallet,
  onConnected,
}: WalletConnectPickerContentProperties) {
  const { t: translate } = useTranslation("common");
  const dispatch = useAppDispatch();
  const { refreshRegistryStatus } = useWalletPrivateAddress();
  const { setWalletConnectInProgress } = useStellarWalletModal();
  const [view, setView] = useState<WalletPickerView>("recommended");
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [supportedWallets, setSupportedWallets] = useState<ISupportedWallet[]>(
    [],
  );
  const [isLoadingWallets, setIsLoadingWallets] = useState(false);

  useEffect(() => {
    if (!open) {
      setView("recommended");
      setConnectingId(null);
      return;
    }

    let cancelled = false;
    setIsLoadingWallets(true);

    void fetchSupportedStellarWallets()
      .then((wallets) => {
        if (!cancelled) {
          setSupportedWallets(wallets);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingWallets(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

  const supportedWalletMap = useMemo(
    () => buildSupportedWalletMap(supportedWallets),
    [supportedWallets],
  );

  const additionalWallets = useMemo(
    () => listAdditionalSupportedWallets(supportedWallets),
    [supportedWallets],
  );

  const connectModule = async (moduleId: string) => {
    if (connectingId) {
      return;
    }

    setConnectingId(moduleId);
    setWalletConnectInProgress(true);

    try {
      const result = await dispatch(connectStellarWalletModule(moduleId));
      if (connectStellarWalletModule.fulfilled.match(result) && result.payload) {
        if (isChangeWallet) {
          await refreshRegistryStatus();
        }
        onConnected();
      }
    } finally {
      setConnectingId(null);
      setWalletConnectInProgress(false);
    }
  };

  const handleRecommendedSelect = async (option: WalletConnectOption) => {
    if (option.opensAllWallets) {
      setView("all-wallets");
      return;
    }

    const moduleId = option.moduleId?.trim();
    if (!moduleId) {
      return;
    }

    const supportedWallet = supportedWalletMap.get(moduleId);
    const isAvailable = supportedWallet?.isAvailable ?? true;
    const productUrl = supportedWallet?.url ?? option.productUrl;

    if (!isAvailable) {
      openWalletProductUrl(productUrl);
      return;
    }

    await connectModule(moduleId);
  };

  const handleSupportedWalletSelect = async (wallet: ISupportedWallet) => {
    if (!wallet.isAvailable) {
      openWalletProductUrl(wallet.url);
      return;
    }

    await connectModule(wallet.id);
  };

  if (view === "all-wallets") {
    return (
      <WalletConnectAllWalletsContent
        wallets={additionalWallets}
        connectingId={connectingId}
        isLoading={isLoadingWallets}
        onBack={() => setView("recommended")}
        onSelectWallet={(wallet) => {
          void handleSupportedWalletSelect(wallet);
        }}
      />
    );
  }

  return (
    <div className="stellar-wallet-list">
      {WALLET_CONNECT_OPTIONS.map((option) => {
        const moduleId = option.moduleId?.trim();
        const supportedWallet = moduleId
          ? supportedWalletMap.get(moduleId)
          : undefined;
        const isAvailable = option.opensAllWallets
          ? true
          : (supportedWallet?.isAvailable ?? !isLoadingWallets);
        const isConnecting = moduleId ? connectingId === moduleId : false;

        return (
          <WalletPickerOptionButton
            key={option.id}
            name={translate(option.nameKey)}
            description={translate(option.descriptionKey)}
            badge={translate(option.badgeKey)}
            iconUrl={supportedWallet?.icon ?? option.iconUrl}
            isAvailable={isAvailable}
            isConnecting={isConnecting}
            disabled={connectingId !== null}
            onSelect={() => {
              void handleRecommendedSelect(option);
            }}
          />
        );
      })}
    </div>
  );
}
