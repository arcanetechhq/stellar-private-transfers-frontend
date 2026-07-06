import {
  needsNativeXlmFunding,
  readNativeXlmBalance,
} from "./read-native-xlm-balance";

const FUNDING_POLL_INTERVAL_MS = 1500;
const FUNDING_POLL_MAX_ATTEMPTS = 40;

function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

export async function waitForNativeXlmFunding(
  publicKey: string,
): Promise<number> {
  const trimmedPublicKey = publicKey.trim();
  if (!trimmedPublicKey) {
    throw new Error("Wallet not connected");
  }

  for (let attempt = 0; attempt < FUNDING_POLL_MAX_ATTEMPTS; attempt += 1) {
    const balance = await readNativeXlmBalance(trimmedPublicKey);
    if (!needsNativeXlmFunding(balance)) {
      return balance;
    }
    await sleep(FUNDING_POLL_INTERVAL_MS);
  }

  throw new Error("Testnet XLM funding did not arrive in time");
}
