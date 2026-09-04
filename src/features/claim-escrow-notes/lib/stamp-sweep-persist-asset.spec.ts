import type { StellarPrivateRecord } from "@arcanetech/privacy-sdk-stellar";
import { stampSweepPersistAsset } from "./stamp-sweep-persist-asset";

const TOKEN = "CTOKENADDRESS00000000000000000000000000000";
const OWNER = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";
const COMMITMENT_HEX =
  "aa901161e699ab3d4ca43cd15e575408441197eba93de07e5da6a2826d2e82d9";
const DEPOSIT_SCALAR_HEX =
  "bb91717c12bb0a89c7fa5c901c74182fc8ad6285d20a7191780fe92f992a1df8";
const SWEEP_STROOPS = 40_000_000n;
const NOTE_VALUE = 40;

function sweepOutput(asset: string): StellarPrivateRecord {
  return {
    id: COMMITMENT_HEX,
    owner: OWNER,
    asset,
    amount: SWEEP_STROOPS,
    consumed: false,
    status: "finalized",
    commitmentHex: COMMITMENT_HEX,
    privateAddress: "stpl1john",
    coinNote: {
      value: String(SWEEP_STROOPS),
      nullifier: "1",
      secret: "2",
      commitment: "3",
      asset_hi: "4",
      asset_lo: "5",
    },
    depositScalarHex: DEPOSIT_SCALAR_HEX,
    amountDisplay: NOTE_VALUE,
  };
}

function amountForTicker(
  records: readonly StellarPrivateRecord[],
  ticker: string,
): number {
  const expected = ticker.toUpperCase();
  return records
    .filter((record) => record.asset.toUpperCase() === expected)
    .reduce((total, record) => total + (record.amountDisplay ?? 0), 0);
}

describe("stampSweepPersistAsset", () => {
  it("does not credit USDC while the sweep coin keeps the token contract as asset", () => {
    const records = [sweepOutput(TOKEN)];
    expect(amountForTicker(records, "USDC")).toBe(0);
    expect(amountForTicker(records, TOKEN)).toBe(NOTE_VALUE);
  });

  it("rewrites sweep outputs onto the catalog ticker so USDC receives the balance", () => {
    const stamped = stampSweepPersistAsset({
      tokenAddress: TOKEN,
      catalog: [{ assetId: "USDC", clientContract: TOKEN }],
      outputRecords: [sweepOutput(TOKEN)],
    });
    expect(stamped.persistAssetId).toBe("USDC");
    expect(amountForTicker(stamped.outputRecords, "USDC")).toBe(NOTE_VALUE);
    expect(amountForTicker(stamped.outputRecords, TOKEN)).toBe(0);
  });
});
