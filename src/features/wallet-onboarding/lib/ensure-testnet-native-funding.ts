import type { AppDispatch } from "@/store";
import { claimNativeFaucetThunk } from "@/features/faucet";
import { isStellarTestnet } from "./is-stellar-testnet";
import {
  needsNativeXlmFunding,
  readNativeXlmBalance,
} from "./read-native-xlm-balance";
import { waitForNativeXlmFunding } from "./wait-for-native-xlm-funding";

const NATIVE_ASSET_ID = "xlm";

export async function ensureTestnetNativeFunding(parameters: {
  dispatch: AppDispatch;
  publicKey: string;
  onStep: (step: "funding") => void;
}): Promise<void> {
  if (!isStellarTestnet()) {
    return;
  }
  const balance = await readNativeXlmBalance(parameters.publicKey);
  if (!needsNativeXlmFunding(balance)) {
    return;
  }
  parameters.onStep("funding");
  await parameters
    .dispatch(
      claimNativeFaucetThunk({
        publicKey: parameters.publicKey,
        assetId: NATIVE_ASSET_ID,
      }),
    )
    .unwrap();
  await waitForNativeXlmFunding(parameters.publicKey);
}
