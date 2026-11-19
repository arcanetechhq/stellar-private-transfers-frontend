import { createHash, createSign, randomBytes } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const FIREBLOCKS_ORIGIN = (
  process.env.FIREBLOCKS_BASE_URL ?? "https://sandbox-api.fireblocks.io"
)
  .replace(/\/v1\/?$/u, "")
  .replace(/\/$/u, "");
const JWT_LIFETIME_SECONDS = 29;
const PEM_MARKER = "BEGIN ";

let acceptedCredentials;

function prototypeDirectory() {
  let current = dirname(fileURLToPath(import.meta.url));
  for (let depth = 0; depth < 8; depth += 1) {
    const candidate = join(current, "fireblock-prototypes");
    if (existsSync(join(candidate, "fireblocks_secret.key"))) {
      return candidate;
    }
    const parent = dirname(current);
    if (parent === current) {
      return "";
    }
    current = parent;
  }
  return "";
}

function readText(path) {
  return readFileSync(path, "utf8");
}

function loadApiKey(prototypeDir) {
  const fromEnv = process.env.FIREBLOCKS_API_KEY?.trim();
  if (fromEnv) {
    return fromEnv;
  }
  const path = join(prototypeDir, "fireblocks_api_key.txt");
  if (!existsSync(path)) {
    return "";
  }
  return readText(path).split("\n")[0]?.trim() ?? "";
}

function loadPrivateKey(prototypeDir) {
  const inline = process.env.FIREBLOCKS_SECRET_KEY?.trim();
  if (inline) {
    return inline;
  }
  const path =
    process.env.FIREBLOCKS_SECRET_KEY_FILE?.trim() ||
    join(prototypeDir, "fireblocks_secret.key");
  if (!existsSync(path)) {
    return "";
  }
  return readText(path);
}

function fileCredentials() {
  const prototypeDir = prototypeDirectory();
  const apiKey = loadApiKey(prototypeDir);
  const privateKey = loadPrivateKey(prototypeDir);
  if (!apiKey || !privateKey) {
    return undefined;
  }
  return { apiKey, privateKey };
}

function codedError(code, status) {
  return Object.assign(new Error(code), { status, code });
}

export function rememberCredentials(credentials) {
  acceptedCredentials = {
    apiKey: credentials.apiKey,
    privateKey: credentials.privateKey,
  };
}

export function credentialsForWalletConnect() {
  if (acceptedCredentials) {
    return acceptedCredentials;
  }
  const stored = fileCredentials();
  if (!stored) {
    throw codedError("key-store", 500);
  }
  return stored;
}

export function credentialsForListing(posted) {
  const apiKey = posted.apiKey.trim();
  const privateKey = posted.privateKey.trim();
  if (apiKey.length === 0) {
    throw codedError("missing-api-key", 400);
  }
  if (privateKey.length > 0) {
    if (!privateKey.includes(PEM_MARKER)) {
      throw codedError("invalid-pem", 400);
    }
    return { apiKey, privateKey };
  }
  if (acceptedCredentials?.apiKey === apiKey) {
    return acceptedCredentials;
  }
  const stored = fileCredentials();
  if (stored?.apiKey === apiKey) {
    return stored;
  }
  throw codedError("missing-pem", 400);
}

function signJwt(apiKey, privateKey, path, body) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const header = Buffer.from(
    JSON.stringify({ alg: "RS256", typ: "JWT" }),
  ).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      uri: path,
      nonce: randomBytes(16).toString("hex"),
      iat: issuedAt,
      exp: issuedAt + JWT_LIFETIME_SECONDS,
      sub: apiKey,
      bodyHash: createHash("sha256").update(body).digest("hex"),
    }),
  ).toString("base64url");
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${payload}`);
  signer.end();
  return `${header}.${payload}.${signer.sign(privateKey).toString("base64url")}`;
}

export async function fireblocks(apiKey, privateKey, method, path, body) {
  const payload = body === undefined ? "" : JSON.stringify(body);
  const response = await fetch(`${FIREBLOCKS_ORIGIN}${path}`, {
    method,
    headers: {
      "X-API-Key": apiKey,
      Authorization: `Bearer ${signJwt(apiKey, privateKey, path, payload)}`,
      ...(payload.length > 0 ? { "Content-Type": "application/json" } : {}),
    },
    ...(payload.length > 0 ? { body: payload } : {}),
  });
  const text = await response.text();
  let parsed = null;
  if (text.length > 0) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { message: text.slice(0, 300) };
    }
  }
  if (!response.ok) {
    const message =
      parsed && typeof parsed.message === "string"
        ? parsed.message
        : `Fireblocks ${method} ${path} failed`;
    throw Object.assign(new Error(message), {
      status: response.status,
      code: "http",
    });
  }
  return parsed ?? {};
}
