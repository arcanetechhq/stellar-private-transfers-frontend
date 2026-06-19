import { Buffer } from "buffer";
import {
  PrivacyPoolSDK,
  type CoinData,
} from "@auditable/privacy-pool-zk-sdk";
import type {
  OnboardingPayload,
  OptionalPrivateAddressRegistration,
  PlaintextNote,
  PrivateAddressRegistration,
} from "registry-contract";
import { privacyPoolService } from "@/shared/lib/privacy-pool/privacy-pool-service";
import { frDecimalToPaddedBytes32 } from "@/shared/lib/privacy-pool/fr-decimal-to-bytes";
import {
  decodePrivateAddress,
  encodePrivateAddressFromHexCoordinates,
} from "@/shared/lib/private-address/privacy-pool-sdk-private-address";

const COORDINATE_HEX_LENGTH = 64;

export type TemporaryRecipientKeyMaterial = {
  temporaryScalarHex: string;
  temporaryPrivateAddressStpl1: string;
  temporaryPublicKeyX: Buffer;
  temporaryPublicKeyY: Buffer;
};

function noneOptionalRegistration(): OptionalPrivateAddressRegistration {
  return { tag: "None" };
}

function coinToPlaintextNote(coin: CoinData): PlaintextNote {
  return {
    asset_hi: frDecimalToPaddedBytes32(coin.asset_hi),
    asset_lo: frDecimalToPaddedBytes32(coin.asset_lo),
    deposited_ephemeral_scalar: undefined,
    nullifier: frDecimalToPaddedBytes32(coin.nullifier),
    secret: frDecimalToPaddedBytes32(coin.secret),
    value: BigInt(coin.value),
  };
}

export async function generateTemporaryRecipientPrivateAddress(): Promise<TemporaryRecipientKeyMaterial> {
  const sdk = await privacyPoolService.getInitializedSdk();
  const temporaryScalarHex = PrivacyPoolSDK.generateRandomScalarHex32();
  const point = sdk.ecdhEphemeralPublicKeyFromScalarHex(temporaryScalarHex);
  const publicKeyXHex = point.x.padStart(COORDINATE_HEX_LENGTH, "0");
  const publicKeyYHex = point.y.padStart(COORDINATE_HEX_LENGTH, "0");
  return {
    temporaryScalarHex,
    temporaryPrivateAddressStpl1: encodePrivateAddressFromHexCoordinates(
      publicKeyXHex,
      publicKeyYHex,
    ),
    temporaryPublicKeyX: Buffer.from(publicKeyXHex, "hex"),
    temporaryPublicKeyY: Buffer.from(publicKeyYHex, "hex"),
  };
}

export function buildOnboardingPayload(parameters: {
  ownerStellarAddress: string;
  temporaryKey: TemporaryRecipientKeyMaterial;
  recipientNotes: CoinData[];
  permanentPrivateAddressStpl1?: string;
}): OnboardingPayload {
  const notes = parameters.recipientNotes.map((coin) => coinToPlaintextNote(coin));
  let privateAddressRegistration = noneOptionalRegistration();
  if (parameters.permanentPrivateAddressStpl1?.trim()) {
    const decoded = decodePrivateAddress(parameters.permanentPrivateAddressStpl1.trim());
    const registration: PrivateAddressRegistration = {
      owner: parameters.ownerStellarAddress.trim(),
      public_key_x: Buffer.from(decoded.x.padStart(COORDINATE_HEX_LENGTH, "0"), "hex"),
      public_key_y: Buffer.from(decoded.y.padStart(COORDINATE_HEX_LENGTH, "0"), "hex"),
    };
    privateAddressRegistration = { tag: "Some", values: [registration] };
  }
  return {
    owner: parameters.ownerStellarAddress.trim(),
    temp_public_key_x: parameters.temporaryKey.temporaryPublicKeyX,
    temp_public_key_y: parameters.temporaryKey.temporaryPublicKeyY,
    encrypted_private_key: Buffer.from(
      parameters.temporaryKey.temporaryScalarHex,
      "utf8",
    ),
    notes: { notes },
    private_address_registration: privateAddressRegistration,
  };
}
