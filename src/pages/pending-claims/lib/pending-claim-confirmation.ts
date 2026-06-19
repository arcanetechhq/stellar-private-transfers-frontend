import { rpc } from "@stellar/stellar-sdk";

const DEFAULT_ASSET_DECIMALS = 7;
const DECIMAL_RADIX = 10;
const CLAIM_TX_POLL_INTERVAL_MS = 1500;
const CLAIM_TX_MAX_POLLS = 40;

export function baseUnitsToDisplayNumber(
  value: string,
  decimals: number | null | undefined = DEFAULT_ASSET_DECIMALS,
): number {
  const digits =
    decimals === null || decimals === undefined ? DEFAULT_ASSET_DECIMALS : decimals;
  const divisor = DECIMAL_RADIX ** digits;
  return Number(BigInt(value)) / divisor;
}

export async function waitForClaimTransactionSuccess(parameters: {
  txId: string;
  sorobanRpcUrl: string;
}): Promise<void> {
  const server = new rpc.Server(parameters.sorobanRpcUrl, { allowHttp: true });
  for (let attempt = 0; attempt < CLAIM_TX_MAX_POLLS; attempt += 1) {
    const response = await server.getTransaction(parameters.txId);
    if (response.status === "SUCCESS") {
      return;
    }
    if (response.status === "FAILED") {
      throw new Error("Pending claim transaction failed on-chain");
    }
    await new Promise((resolve) => {
      setTimeout(resolve, CLAIM_TX_POLL_INTERVAL_MS);
    });
  }
  throw new Error("Pending claim transaction was not confirmed in time");
}
