import { FREIGHTER_PRODUCT_URL } from "./wallet-options";

export async function resolveFreighterAvailability(): Promise<{
  isAvailable: boolean;
  productUrl: string;
}> {
  return {
    isAvailable: true,
    productUrl: FREIGHTER_PRODUCT_URL,
  };
}

export function openFreighterProductUrl(url = FREIGHTER_PRODUCT_URL): void {
  globalThis.open(url, "_blank", "noopener,noreferrer");
}
