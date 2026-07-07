import { Buffer } from "buffer";
import type { CoinData } from "@/shared/lib/privacy-sdk/types.js";
import type { OnboardingPayload } from "@arcane/privacy-sdk-stellar/transact";
import type { PrivateAddressRegistration } from "@arcane/privacy-sdk-stellar/transact";
import type { PendingClaimItem } from "@/entities/pending-claims";
import { decodePrivateAddress } from "@/shared/lib/privacy-sdk/index.js";

const FIELD_HEX_LENGTH = 64;
const SCALAR_HEX_PATTERN = new RegExp(
  `^(0x)?[0-9a-f]{${FIELD_HEX_LENGTH}}$`,
  "iu",
);

function hexToBuffer(hex: string): Buffer {
  const clean = hex.trim().replace(/^0x/u, "");
  return Buffer.from(clean.padStart(FIELD_HEX_LENGTH, "0"), "hex");
}

function hexToDecimal(hex: string): string {
  const clean = hex.trim().replace(/^0x/u, "");
  return BigInt(`0x${clean || "0"}`).toString();
}

function buildRegistration(parameters: {
  ownerAddress: string;
  privateAddressStpl1: string;
}): PrivateAddressRegistration {
  const decoded = decodePrivateAddress(parameters.privateAddressStpl1.trim());
  return {
    owner: parameters.ownerAddress.trim(),
    public_key_x: hexToBuffer(decoded.x),
    public_key_y: hexToBuffer(decoded.y),
  };
}

export function base64RecoveryScalar(base64: string): string {
  const scalar = Buffer.from(base64.trim(), "base64").toString("utf8").trim();
  if (!SCALAR_HEX_PATTERN.test(scalar)) {
    throw new Error("Pending claim recovery payload is not a scalar");
  }
  return scalar.replace(/^0x/iu, "");
}

export function claimToCoin(claim: PendingClaimItem): CoinData {
  return {
    value: claim.noteValue,
    nullifier: hexToDecimal(claim.nullifierFieldHex),
    secret: hexToDecimal(claim.secretHex),
    commitment: hexToDecimal(claim.commitmentHex),
    asset_hi: hexToDecimal(claim.assetHiHex),
    asset_lo: hexToDecimal(claim.assetLoHex),
  };
}

export function buildClaimOnboardingPayload(parameters: {
  claim: PendingClaimItem;
  privateAddressStpl1: string;
}): OnboardingPayload {
  return {
    owner: parameters.claim.ownerAddress.trim(),
    temp_public_key_x: hexToBuffer(parameters.claim.tempPublicKeyXHex),
    temp_public_key_y: hexToBuffer(parameters.claim.tempPublicKeyYHex),
    encrypted_private_key: Buffer.from(
      parameters.claim.encryptedRecoveryBase64.trim(),
      "base64",
    ),
    notes: { notes: [] },
    private_address_registration: {
      tag: "Some",
      values: [
        buildRegistration({
          ownerAddress: parameters.claim.ownerAddress,
          privateAddressStpl1: parameters.privateAddressStpl1,
        }),
      ],
    },
  };
}
