import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store";
import { selectWalletProviderName } from "../model/wallet";

export function useWalletProviderLabel(): string {
  const { t: translate } = useTranslation("common");
  const providerName = useAppSelector(selectWalletProviderName);

  return providerName ?? translate("walletProviderStellar");
}
