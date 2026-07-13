import { getConfiguredPrivacyPoolService } from "./transact-context.js";
import { decodePrivateAddress } from "@arcanetech/privacy-sdk-stellar/transact";

type EphemeralPoint = {
  x: string;
  y: string;
};

type InitializedSdk = Awaited<
  ReturnType<ReturnType<typeof getPrivacyPoolService>["getInitializedSdk"]>
>;

function readEncodeDecodedEphemeralKey(
  sdk: InitializedSdk,
): (point: EphemeralPoint) => string {
  const candidate = (
    sdk as { encodeDecodedEphemeralKey?: (point: EphemeralPoint) => string }
  ).encodeDecodedEphemeralKey;
  if (typeof candidate !== "function") {
    throw new TypeError(
      "Privacy pool SDK does not expose encodeDecodedEphemeralKey",
    );
  }
  return candidate;
}

function readGenerateRandomScalarHex32(sdk: InitializedSdk): () => string {
  const ctor = sdk.constructor as { generateRandomScalarHex32?: () => string };
  if (typeof ctor.generateRandomScalarHex32 !== "function") {
    throw new TypeError(
      "Privacy pool SDK does not expose generateRandomScalarHex32",
    );
  }
  return ctor.generateRandomScalarHex32.bind(ctor);
}

export async function encodeEphemeralKeyFromDepositScalar(
  depositScalarHex: string,
): Promise<string> {
  const sdk = await getConfiguredPrivacyPoolService().getInitializedSdk();
  const point = sdk.ecdhEphemeralPublicKeyFromScalarHex(depositScalarHex);
  return readEncodeDecodedEphemeralKey(sdk)(point);
}

export async function sharedSecretFromDepositorPreimage(input: {
  depositScalarHex: string;
  recipientPrivateAddressStpl1: string;
}): Promise<{ sharedSecretX: string }> {
  const sdk = await getConfiguredPrivacyPoolService().getInitializedSdk();
  const recipientPrivateAddress = decodePrivateAddress(
    input.recipientPrivateAddressStpl1.trim(),
  );
  const shared = sdk.sharedSecretFromDepositorPreimage({
    randomNonceScalar: input.depositScalarHex,
    recipientStealthAddress: recipientPrivateAddress,
  });
  return { sharedSecretX: shared.x };
}

export async function generateRandomDepositScalarHex(): Promise<string> {
  const sdk = await getConfiguredPrivacyPoolService().getInitializedSdk();
  return readGenerateRandomScalarHex32(sdk)();
}

export async function ecdhEphemeralPublicKeyFromScalarHex(
  scalarHex: string,
): Promise<{ x: string; y: string }> {
  const sdk = await getConfiguredPrivacyPoolService().getInitializedSdk();
  return sdk.ecdhEphemeralPublicKeyFromScalarHex(scalarHex);
}
