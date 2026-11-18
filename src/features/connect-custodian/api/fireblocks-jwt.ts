const JWT_HEADER = { alg: "RS256", typ: "JWT" };
const JWT_LIFETIME_SECONDS = 29;
const MILLISECONDS_PER_SECOND = 1000;
const NONCE_BYTE_LENGTH = 16;
const HEX_RADIX = 16;
const RSA_SIGNATURE_ALGORITHM = "RSASSA-PKCS1-v1_5";

export type SignFireblocksJwtInput = {
  uriPath: string;
  body: string;
  apiKey: string;
  signingKey: CryptoKey;
};

function bytesToHex(bytes: Uint8Array): string {
  return [...bytes]
    .map((byte) => byte.toString(HEX_RADIX).padStart(2, "0"))
    .join("");
}

function encodeBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCodePoint(byte);
  }
  return globalThis
    .btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function encodeJson(value: unknown): Uint8Array {
  return new TextEncoder().encode(JSON.stringify(value));
}

async function sha256Hex(body: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(body),
  );
  return bytesToHex(new Uint8Array(digest));
}

function createNonce(): string {
  const bytes = new Uint8Array(NONCE_BYTE_LENGTH);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
}

export async function signFireblocksJwt(
  input: SignFireblocksJwtInput,
): Promise<string> {
  const issuedAt = Math.floor(Date.now() / MILLISECONDS_PER_SECOND);
  const header = encodeBase64Url(encodeJson(JWT_HEADER));
  const payload = encodeBase64Url(
    encodeJson({
      uri: input.uriPath,
      nonce: createNonce(),
      iat: issuedAt,
      exp: issuedAt + JWT_LIFETIME_SECONDS,
      sub: input.apiKey,
      bodyHash: await sha256Hex(input.body),
    }),
  );
  const signingInput = `${header}.${payload}`;
  const signature = await crypto.subtle.sign(
    RSA_SIGNATURE_ALGORITHM,
    input.signingKey,
    new TextEncoder().encode(signingInput),
  );
  return `${signingInput}.${encodeBase64Url(new Uint8Array(signature))}`;
}
