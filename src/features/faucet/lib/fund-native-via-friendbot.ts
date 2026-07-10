import { fetchAccountBalances } from "@/shared/stellar/fetch-account-balances";
import { horizonServer } from "@/shared/stellar/horizon-server";

const FRIENDBOT_URL = "https://friendbot.stellar.org";
const FRIENDBOT_STARTING_BALANCE_XLM = 10_000;
const ALREADY_FUNDED_DETAIL = "account already funded to starting balance";

export type FriendbotFundingResult = "funded" | "already_funded";

async function readNativeBalanceXlm(
  publicKey: string,
): Promise<number | undefined> {
  try {
    const balances = await fetchAccountBalances(horizonServer, publicKey);
    const native = balances.find((entry) => entry.assetType === "native");
    if (!native) {
      return undefined;
    }
    const parsed = Number.parseFloat(native.balance);
    return Number.isFinite(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function isAlreadyFundedFriendbotBody(body: unknown): boolean {
  if (typeof body !== "object" || body === null) {
    return false;
  }
  if (!("detail" in body)) {
    return false;
  }
  return body.detail === ALREADY_FUNDED_DETAIL;
}

export async function fundNativeViaFriendbot(
  publicKey: string,
): Promise<FriendbotFundingResult> {
  const balance = await readNativeBalanceXlm(publicKey);
  if (
    balance !== undefined &&
    balance >= FRIENDBOT_STARTING_BALANCE_XLM
  ) {
    return "already_funded";
  }

  const url = `${FRIENDBOT_URL}?addr=${encodeURIComponent(publicKey)}`;
  const response = await fetch(url);
  if (response.ok) {
    return "funded";
  }

  if (response.status === 400) {
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      body = undefined;
    }
    if (isAlreadyFundedFriendbotBody(body)) {
      return "already_funded";
    }
  }

  throw new Error(`Friendbot error: ${String(response.status)}`);
}
