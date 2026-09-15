import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit/sdk";

const DEFAULT_WALLET_MODULE_ID = "freighter";

function readKitErrorField(
  error: unknown,
  field: "code" | "message",
): unknown {
  if (!error || typeof error !== "object" || !(field in error)) {
    return undefined;
  }
  return (error as Record<string, unknown>)[field];
}

function isMissingKitAddressError(error: unknown): boolean {
  const code = readKitErrorField(error, "code");
  const message = readKitErrorField(error, "message");
  const text = typeof message === "string" ? message : "";
  if (code === -1 && text.includes("No wallet has been connected")) {
    return true;
  }
  return code === -3 && text.toLowerCase().includes("set the wallet first");
}

function ensureSelectedWallet(): void {
  try {
    void StellarWalletsKit.selectedModule;
  } catch {
    StellarWalletsKit.setWallet(DEFAULT_WALLET_MODULE_ID);
  }
}

export async function readConnectedWalletAddress(): Promise<string> {
  try {
    const { address } = await StellarWalletsKit.getAddress();
    const trimmed = address.trim();
    if (trimmed) {
      return trimmed;
    }
  } catch (error: unknown) {
    if (!isMissingKitAddressError(error)) {
      throw error;
    }
  }

  ensureSelectedWallet();
  const { address } = await StellarWalletsKit.fetchAddress();
  const trimmed = address.trim();
  if (!trimmed) {
    throw new Error("Wallet not connected");
  }
  return trimmed;
}
