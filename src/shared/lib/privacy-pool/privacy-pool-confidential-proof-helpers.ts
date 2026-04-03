import {
  ed25519PubkeyPayloadHexToWithdrawFrDecimals,
  privKeyScalarDecimalFromStellarSignature,
  withdrawObjectFromMerkleWitness,
} from "@auditable/privacy-pool-zk-sdk";
import type { CoinData, PrivacyPoolSDK, StateFile } from "@auditable/privacy-pool-zk-sdk";
import { StrKey } from "@stellar/stellar-sdk";
import { Buffer } from "buffer";

export const MIN_CONFIDENTIAL_TRANSFER_STROOPS = 1n;
export const ZERO_STROOPS = 0n;

type LeafEphemeralCoords = { x: string; y: string };

function leafEphemeralCoords(xHex: string, yHex: string): LeafEphemeralCoords {
  const coords = {} as LeafEphemeralCoords;
  Object.defineProperty(coords, "x", {
    value: xHex,
    enumerable: true,
    writable: true,
  });
  Object.defineProperty(coords, "y", {
    value: yHex,
    enumerable: true,
    writable: true,
  });
  return coords;
}

export function withdrawWitnessForCoin(parameters: {
  sdk: PrivacyPoolSDK;
  coin: CoinData;
  state: StateFile;
  xHex: string;
  yHex: string;
}) {
  const { sdk, coin, state, xHex, yHex } = parameters;
  const witness = sdk.buildWithdrawMerkleWitness(coin, state);
  const withdrawObject = withdrawObjectFromMerkleWitness(
    witness,
    leafEphemeralCoords(xHex, yHex),
  );
  return { witness, withdrawObject };
}

export async function senderWithdrawFrAndScalar(parameters: {
  senderGAddress: string;
  senderWithdrawSignMessageSignature: string;
}): Promise<{
  hi: string;
  lo: string;
  privKeyScalar: string;
}> {
  const pkRaw = StrKey.decodeEd25519PublicKey(parameters.senderGAddress);
  const pkHex = Buffer.from(pkRaw).toString("hex");
  const { hi, lo } = ed25519PubkeyPayloadHexToWithdrawFrDecimals(pkHex);
  const privKeyScalar = await privKeyScalarDecimalFromStellarSignature(
    parameters.senderWithdrawSignMessageSignature,
  );
  return { hi, lo, privKeyScalar };
}

export function requireChangeRecipientWhenPartial(
  changeStroops: bigint,
  selfStealthStpl1ForChange: string | undefined,
): void {
  if (changeStroops > ZERO_STROOPS) {
    const stpl1 = selfStealthStpl1ForChange?.trim() ?? "";
    if (!stpl1) {
      throw new Error(
        "Stealth address is required to receive the remaining balance after a partial transfer",
      );
    }
  }
}

export function changeStroopsAfterDualTransfer(
  transferStroops: bigint,
  totalNotes: bigint,
): bigint {
  if (transferStroops < MIN_CONFIDENTIAL_TRANSFER_STROOPS) {
    throw new Error("Transfer amount must be positive");
  }
  if (transferStroops > totalNotes) {
    throw new Error("Transfer amount exceeds combined note value");
  }
  return totalNotes - transferStroops;
}
