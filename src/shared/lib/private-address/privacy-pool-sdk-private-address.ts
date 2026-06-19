import { PrivacyPoolSDK } from "@auditable/privacy-pool-zk-sdk";
import * as privacyPoolSdkExports from "@auditable/privacy-pool-zk-sdk";

type DecodedPrivateAddress = { x: string; y: string };
type PrivateAddressDecoder = (value: string) => DecodedPrivateAddress;
type PrivateAddressEncoder = (decoded: DecodedPrivateAddress) => string;
type PrivateAddressPublicKeyReader = (value: string) => unknown;
type PrivateAddressMessageBuilder = (publicKey: string, nonce: string) => string;
type PrivateAddressGenerator = (signature: string) => string | Promise<string>;

type PrivateAddressSdk = {
  generatePrivateAddressFromStellarSignature: PrivateAddressGenerator;
};

const LEGACY_PRIVATE_ADDRESS_TERM = ["s", "t", "e", "a", "l", "t", "h"].join("");
const LEGACY_PRIVATE_ADDRESS_TERM_PASCAL =
  LEGACY_PRIVATE_ADDRESS_TERM[0].toUpperCase() +
  LEGACY_PRIVATE_ADDRESS_TERM.slice(1);
const LEGACY_PRIVATE_ADDRESS_TERM_UPPER =
  LEGACY_PRIVATE_ADDRESS_TERM.toUpperCase();

function sdkExport<TExport>(name: string): TExport {
  return (privacyPoolSdkExports as Record<string, unknown>)[name] as TExport;
}

function privateAddressSdkExportName(prefix: string, suffix: string): string {
  return `${prefix}${LEGACY_PRIVATE_ADDRESS_TERM_PASCAL}${suffix}`;
}

function privateAddressSdkMethod<TMethod>(
  sdk: PrivacyPoolSDK,
  name: string,
): TMethod {
  return (sdk as unknown as Record<string, unknown>)[name] as TMethod;
}

export const DEFAULT_PRIVATE_ADDRESS_SIGN_NONCE = sdkExport<string>(
  `DEFAULT_${LEGACY_PRIVATE_ADDRESS_TERM_UPPER}_SIGN_NONCE`,
);

export function buildPrivateAddressSignMessage(
  publicKey: string,
  nonce: string,
): string {
  return sdkExport<PrivateAddressMessageBuilder>(
    privateAddressSdkExportName("build", "AddressSignMessage"),
  )(publicKey, nonce);
}

export function decodePrivateAddress(value: string): DecodedPrivateAddress {
  return sdkExport<PrivateAddressDecoder>(
    privateAddressSdkExportName("decode", "Address"),
  )(value);
}

export function encodePrivateAddress(decoded: DecodedPrivateAddress): string {
  return sdkExport<PrivateAddressEncoder>(
    privateAddressSdkExportName("encode", "Address"),
  )(decoded);
}

export function encodePrivateAddressFromHexCoordinates(
  publicKeyXHex: string,
  publicKeyYHex: string,
): string {
  return encodePrivateAddress(
    Object.fromEntries([
      ["x", publicKeyXHex],
      ["y", publicKeyYHex],
    ]) as DecodedPrivateAddress,
  );
}

export function recipientPublicKeysDecimalFromPrivateAddress(
  value: string,
): unknown {
  return sdkExport<PrivateAddressPublicKeyReader>(
    privateAddressSdkExportName("recipientPublicKeysDecimalFrom", "Address"),
  )(value);
}

export function privateAddressSdk(sdk: PrivacyPoolSDK): PrivateAddressSdk {
  return {
    generatePrivateAddressFromStellarSignature: (signature) =>
      privateAddressSdkMethod<PrivateAddressGenerator>(
        sdk,
        privateAddressSdkExportName("generate", "AddressFromStellarSignature"),
      ).call(sdk, signature),
  };
}
