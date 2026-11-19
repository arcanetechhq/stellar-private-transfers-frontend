import { createServer } from "node:http";
import {
  credentialsForListing,
  credentialsForWalletConnect,
  fireblocks,
  rememberCredentials,
} from "./fireblocks-client.mjs";
import { listStellarAssetWallets } from "./stellar-asset-wallets.mjs";

const PORT = Number(process.env.CUSTODIAN_WC_PORT ?? 5195);
const HOST = "0.0.0.0";
const CONNECTIONS_PATH = "/v1/connections/wc";
const SESSION_PATH = "/api/custodian/wallet-connect";
const WALLETS_PATH = "/api/custodian/asset-wallets";
const HEALTH_PATH = "/api/custodian/health";
const BODY_LIMIT = 65_536;
const STELLAR_TESTNET_CHAIN = "stellar:testnet";

function connectionId(payload) {
  if (!payload || typeof payload.id !== "string" || payload.id.trim() === "") {
    throw Object.assign(
      new Error("Fireblocks did not return a WalletConnect connection id"),
      { status: 502, code: "invalid-response" },
    );
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
          Object.assign(new Error("Request body is too large"), { status: 413 }),
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
    throw Object.assign(new Error("Request body must be JSON"), { status: 400 });
  }
  const uri = typeof payload?.uri === "string" ? payload.uri.trim() : "";
  const vaultRaw = payload?.vaultAccountId;
  const vaultText =
    typeof vaultRaw === "number" ? String(vaultRaw) : String(vaultRaw ?? "").trim();
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

function postedCredentials(raw) {
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    throw Object.assign(new Error("invalid-response"), {
      status: 400,
      code: "invalid-response",
    });
  }
  return {
    apiKey: typeof payload?.apiKey === "string" ? payload.apiKey : "",
    privateKey: typeof payload?.privateKey === "string" ? payload.privateKey : "",
  };
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

function sendFailure(response, error, fallback) {
  const status = Number(error?.status) || 502;
  const code = typeof error?.code === "string" ? error.code : "http";
  const message = error instanceof Error ? error.message : fallback;
  sendJson(response, status, {
    code,
    status,
    error: message.replace(/wc:\S+/gu, "[session]"),
  });
}

async function handleAssetWallets(request, response) {
  const raw = await readRequestBody(request);
  const credentials = credentialsForListing(postedCredentials(raw));
  const wallets = await listStellarAssetWallets((path) =>
    fireblocks(credentials.apiKey, credentials.privateKey, "GET", path),
  );
  rememberCredentials(credentials);
  sendJson(response, 200, { wallets });
}

async function handleWalletConnect(request, response) {
  const raw = await readRequestBody(request);
  const session = sessionRequest(raw);
  const opened = await openWalletConnectSession(
    credentialsForWalletConnect(),
    session,
  );
  sendJson(response, 200, opened);
}

const server = createServer(async (request, response) => {
  if (request.method === "OPTIONS") {
    sendJson(response, 204, {});
    return;
  }
  const url = new URL(request.url ?? "/", "http://127.0.0.1");
  try {
    if (request.method === "GET" && url.pathname === HEALTH_PATH) {
      sendJson(response, 200, { ok: true });
      return;
    }
    if (request.method === "POST" && url.pathname === WALLETS_PATH) {
      await handleAssetWallets(request, response);
      return;
    }
    if (request.method === "POST" && url.pathname === SESSION_PATH) {
      await handleWalletConnect(request, response);
      return;
    }
    sendJson(response, 404, { error: "Not found" });
  } catch (error) {
    sendFailure(response, error, "Custodian request failed");
  }
});

server.listen(PORT, HOST, () => {
  process.stdout.write(
    `custodian walletconnect listening on http://${HOST}:${PORT}\n`,
  );
});
