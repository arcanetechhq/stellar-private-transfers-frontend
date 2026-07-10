import {
  buildSupportedWalletMap,
  fetchSupportedStellarWallets,
} from "./fetch-supported-stellar-wallets";
import {
  FREIGHTER_PRODUCT_URL,
  FREIGHTER_WALLET_ID,
} from "./wallet-options";

export async function resolveFreighterAvailability(): Promise<{
  isAvailable: boolean;
  productUrl: string;
}> {
  try {
    const wallets = await fetchSupportedStellarWallets();
    const freighter = buildSupportedWalletMap(wallets).get(FREIGHTER_WALLET_ID);
    return {
      isAvailable: freighter?.isAvailable ?? false,
      productUrl: freighter?.url?.trim() || FREIGHTER_PRODUCT_URL,
    };
  } catch {
    return {
      isAvailable: false,
      productUrl: FREIGHTER_PRODUCT_URL,
    };
  }
}

export function openFreighterProductUrl(url = FREIGHTER_PRODUCT_URL): void {
  globalThis.open(url, "_blank", "noopener,noreferrer");
}
