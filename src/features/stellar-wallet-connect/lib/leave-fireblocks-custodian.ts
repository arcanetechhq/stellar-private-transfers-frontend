import type { AppDispatch } from "@/store";
import {
  FIREBLOCKS_WALLET_PROVIDER,
  type WalletState,
} from "@/entities/wallet";
import { custodianSessionPort } from "@/entities/wallet";

function readWallet(state: unknown): WalletState | undefined {
  if (!state || typeof state !== "object" || !("wallet" in state)) {
    return undefined;
  }
  return (state as { wallet?: WalletState }).wallet;
}

export function shouldLeaveFireblocksCustodian(state: unknown): boolean {
  const wallet = readWallet(state);
  return (
    wallet?.providerName === FIREBLOCKS_WALLET_PROVIDER ||
    custodianSessionPort().hasSelection()
  );
}

export async function leaveFireblocksBeforeOtherWallet(input: {
  dispatch: AppDispatch;
  getState: () => unknown;
}): Promise<void> {
  if (!shouldLeaveFireblocksCustodian(input.getState())) {
    return;
  }
  const wallet = readWallet(input.getState());
  const connected = wallet?.providerName === FIREBLOCKS_WALLET_PROVIDER;
  await custodianSessionPort().leave({
    dispatch: input.dispatch,
    fireblocksPublicKey: connected ? wallet?.publicKey : undefined,
  });
}
