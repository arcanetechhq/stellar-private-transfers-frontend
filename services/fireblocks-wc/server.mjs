import { createHash, createSign, randomBytes } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PORT = Number(process.env.CUSTODIAN_WC_PORT ?? 5195);
const HOST = "0.0.0.0";
const FIREBLOCKS_ORIGIN = (
  process.env.FIREBLOCKS_BASE_URL ?? "https://sandbox-api.fireblocks.io"
)
  .replace(/\/v1\/?$/u, "")
  .replace(/\/$/u, "");
const CONNECTIONS_PATH = "/v1/connections/wc";
const SESSION_PATH = "/api/custodian/wallet-connect";
const HEALTH_PATH = "/api/custodian/health";
const FORWARD_PREFIX = "/api/fireblocks";
const BODY_LIMIT = 65_536;
const JWT_LIFETIME_SECONDS = 29;
const STELLAR_TESTNET_CHAIN = "stellar:testnet";

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

async function fireblocks(apiKey, privateKey, method, path, body) {
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
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  return parsed ?? {};
}

function connectionId(payload) {
  if (!payload || typeof payload.id !== "string" || payload.id.trim() === "") {
    throw new Error("Fireblocks did not return a WalletConnect connection id");
  }
  return payload.id.trim();
}

async function openWalletConnectSession(credentials, request) {
  const created = await fireblocks(
    credentials.apiKey,
    credentials.privateKey,
    "POST",
    CONNECTIONS_PATH,
    {
      feeLevel: "MEDIUM",
      vaultAccountId: request.vaultAccountId,
      uri: request.uri,
      chainIds: [STELLAR_TESTNET_CHAIN],
    },
  );
  const id = connectionId(created);
  await fireblocks(
    credentials.apiKey,
    credentials.privateKey,
    "PUT",
    `${CONNECTIONS_PATH}/${encodeURIComponent(id)}`,
    { approve: true },
  );
  return { id };
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    request.on("data", (chunk) => {
      size += chunk.length;
      if (size > BODY_LIMIT) {
        reject(
          Object.assign(new Error("Request body is too large"), {
            status: 413,
          }),
        );
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on("end", () => {
      resolve(Buffer.concat(chunks).toString("utf8"));
    });
    request.on("error", reject);
  });
}

function sessionRequest(raw) {
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    throw Object.assign(new Error("Request body must be JSON"), {
      status: 400,
    });
  }
  const uri = typeof payload?.uri === "string" ? payload.uri.trim() : "";
  const vaultRaw = payload?.vaultAccountId;
  const vaultText =
    typeof vaultRaw === "number"
      ? String(vaultRaw)
      : String(vaultRaw ?? "").trim();
  if (!uri.startsWith("wc:")) {
    throw Object.assign(new Error("uri must be a WalletConnect URI"), {
      status: 400,
    });
  }
  if (!/^\d+$/u.test(vaultText)) {
    throw Object.assign(new Error("vaultAccountId must be the vault number"), {
      status: 400,
    });
  }
  return { uri, vaultAccountId: Number(vaultText) };
}

function isVaultForward(pathname) {
  return (
    pathname === FORWARD_PREFIX || pathname.startsWith(`${FORWARD_PREFIX}/`)
  );
}

function vaultTargetPath(url) {
  const rest = `${url.pathname.slice(FORWARD_PREFIX.length)}${url.search}`;
  if (rest !== "/v1" && !rest.startsWith("/v1/")) {
    return "";
  }
  return rest;
}

function browserVaultHeaders(request, body) {
  const headers = {};
  const authorization = request.headers.authorization;
  const apiKey = request.headers["x-api-key"];
  if (typeof authorization === "string" && authorization.length > 0) {
    headers.Authorization = authorization;
  }
  if (typeof apiKey === "string" && apiKey.length > 0) {
    headers["X-API-Key"] = apiKey;
  }
  if (body.length > 0) {
    const contentType = request.headers["content-type"];
    headers["Content-Type"] =
      typeof contentType === "string" && contentType.length > 0
        ? contentType
        : "application/json";
  }
  return headers;
}

async function forwardVaultCall(request, response, targetPath) {
  const method = request.method ?? "GET";
  if (method !== "GET" && method !== "POST" && method !== "PUT") {
    sendJson(response, 405, { error: "Method not allowed" });
    return;
  }
  const body = method === "GET" ? "" : await readRequestBody(request);
  let upstream;
  try {
    upstream = await fetch(`${FIREBLOCKS_ORIGIN}${targetPath}`, {
      method,
      headers: browserVaultHeaders(request, body),
      ...(body.length > 0 ? { body } : {}),
    });
  } catch {
    sendJson(response, 502, { error: "Fireblocks could not be reached" });
    return;
  }
  const text = await upstream.text();
  response.writeHead(upstream.status, {
    "Content-Type": upstream.headers.get("content-type") ?? "application/json",
    "Content-Length": Buffer.byteLength(text),
  });
  response.end(text);
}

function sendJson(response, status, payload) {
  const body = JSON.stringify(payload);
  response.writeHead(status, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(body),
  });
  response.end(body);
}

function loadCredentials() {
  const prototypeDir = prototypeDirectory();
  const apiKey = loadApiKey(prototypeDir);
  const privateKey = loadPrivateKey(prototypeDir);
  if (!apiKey || !privateKey) {
    throw Object.assign(
      new Error(
        "Fireblocks API key or PEM is missing. Set FIREBLOCKS_API_KEY and FIREBLOCKS_SECRET_KEY, or keep the prototype files in fireblock-prototypes.",
      ),
      { status: 500 },
    );
  }
  return { apiKey, privateKey };
}

const server = createServer(async (request, response) => {
  if (request.method === "OPTIONS") {
    sendJson(response, 204, {});
    return;
  }
  const url = new URL(request.url ?? "/", "http://127.0.0.1");
  if (request.method === "GET" && url.pathname === HEALTH_PATH) {
    sendJson(response, 200, { ok: true });
    return;
  }
  if (isVaultForward(url.pathname)) {
    const targetPath = vaultTargetPath(url);
    if (!targetPath) {
      sendJson(response, 404, { error: "Not found" });
      return;
    }
    try {
      await forwardVaultCall(request, response, targetPath);
    } catch (error) {
      const status = Number(error?.status) || 502;
      sendJson(response, status, { error: "Fireblocks could not be reached" });
    }
    return;
  }
  if (request.method !== "POST" || url.pathname !== SESSION_PATH) {
    sendJson(response, 404, { error: "Not found" });
    return;
  }
  try {
    const raw = await readRequestBody(request);
    const session = sessionRequest(raw);
    const opened = await openWalletConnectSession(loadCredentials(), session);
    sendJson(response, 200, opened);
  } catch (error) {
    const status = Number(error?.status) || 502;
    const message =
      error instanceof Error ? error.message : "WalletConnect session failed";
    sendJson(response, status, {
      error: message.replace(/wc:\S+/gu, "[session]"),
    });
  }
});

server.listen(PORT, HOST, () => {
  process.stdout.write(
    `custodian walletconnect listening on http://${HOST}:${PORT}\n`,
  );
});
