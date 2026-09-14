import { execFileSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const CONTRACTS_REPO = "Polynom-Labs/stellar-privacy-layer-contracts";
const TWO_BY_TWO_FILES = [
  "main.graph.bin",
  "main.r1cs.gz",
  "main_proving_key.bin",
];
const SIX_BY_SIX_FILES = [
  "main_6x6.graph.bin",
  "main_6x6.r1cs.gz",
  "main_6x6_proving_key.bin",
];

export function zkArtifactFileNames(nonceRaw) {
  const files = [...TWO_BY_TWO_FILES];
  const nonce = (nonceRaw ?? "").trim();
  if (nonce === "6" || nonce === "7") {
    files.push(...SIX_BY_SIX_FILES);
  }
  return files;
}

function readZkSdkVersion(projectRoot) {
  const candidates = [
    join(
      projectRoot,
      "node_modules/@arcanetech/stellar-privacy-pool-zk-sdk/package.json",
    ),
    join(
      projectRoot,
      "node_modules/@arcanetech/privacy-sdk-stellar/node_modules/@arcanetech/stellar-privacy-pool-zk-sdk/package.json",
    ),
  ];
  for (const pkgPath of candidates) {
    if (!existsSync(pkgPath)) {
      continue;
    }
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
    if (typeof pkg.version === "string" && pkg.version.length > 0) {
      return pkg.version.startsWith("v") ? pkg.version.slice(1) : pkg.version;
    }
  }
  throw new Error(
    "Cannot resolve @arcanetech/stellar-privacy-pool-zk-sdk version. Run npm install.",
  );
}

function applyDotEnv(projectRoot, env) {
  const fromProcess = new Set(
    Object.keys(env).filter((key) => env[key] !== undefined && env[key] !== ""),
  );
  for (const name of [".env", ".env.local"]) {
    const filePath = join(projectRoot, name);
    if (!existsSync(filePath)) {
      continue;
    }
    for (const line of readFileSync(filePath, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }
      const separator = trimmed.indexOf("=");
      if (separator <= 0) {
        continue;
      }
      const key = trimmed.slice(0, separator);
      let value = trimmed.slice(separator + 1);
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!fromProcess.has(key)) {
        env[key] = value;
      }
    }
  }
}

function githubToken() {
  const fromEnv =
    process.env.GH_TOKEN?.trim() || process.env.GITHUB_TOKEN?.trim();
  if (fromEnv) {
    return fromEnv;
  }
  try {
    const token = execFileSync("gh", ["auth", "token"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return token.length > 0 ? token : undefined;
  } catch {
    return undefined;
  }
}

function artifactIsPresent(filePath) {
  return existsSync(filePath) && statSync(filePath).size > 0;
}

async function downloadGithubAsset(url, destPath, token) {
  const headers = {
    Accept: "application/octet-stream",
    "User-Agent": "stellar-payment-client-v2",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(url, { headers, redirect: "follow" });
  if (!response.ok) {
    throw new Error(`${url} -> ${String(response.status)}`);
  }
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength === 0) {
    throw new Error(`${url} returned an empty body`);
  }
  const tempPath = `${destPath}.tmp`;
  writeFileSync(tempPath, bytes);
  renameSync(tempPath, destPath);
}

async function downloadFromGithubRelease(params) {
  const { destDir, files, tag, token } = params;
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "stellar-payment-client-v2",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const releaseUrl = `https://api.github.com/repos/${CONTRACTS_REPO}/releases/tags/v${tag}`;
  const response = await fetch(releaseUrl, { headers });
  if (!response.ok) {
    throw new Error(`GitHub release v${tag}: HTTP ${String(response.status)}`);
  }
  const release = await response.json();
  const assets = Array.isArray(release.assets) ? release.assets : [];
  for (const fileName of files) {
    const destPath = join(destDir, fileName);
    if (artifactIsPresent(destPath)) {
      continue;
    }
    const asset = assets.find((entry) => entry.name === fileName);
    if (!asset || typeof asset.url !== "string") {
      throw new Error(`GitHub release v${tag} has no asset ${fileName}`);
    }
    await downloadGithubAsset(asset.url, destPath, token);
  }
}

function copyFromLocalCircuits(projectRoot, destDir, files) {
  const sourceDir = join(
    projectRoot,
    "..",
    "soroban-privacy-pools",
    "circuits",
    "output",
  );
  const missing = [];
  for (const fileName of files) {
    const destPath = join(destDir, fileName);
    if (artifactIsPresent(destPath)) {
      continue;
    }
    const sourcePath = join(sourceDir, fileName);
    if (!artifactIsPresent(sourcePath)) {
      missing.push(fileName);
      continue;
    }
    copyFileSync(sourcePath, destPath);
  }
  return missing;
}

export async function vendorZkArtifacts(options) {
  const projectRoot = options.projectRoot;
  const env = options.env ?? process.env;
  const destDir = join(projectRoot, "public", "zk-artifacts");
  const files = zkArtifactFileNames(env.VITE_ZK_CONFIG_NONCE);
  mkdirSync(destDir, { recursive: true });

  const pending = files.filter(
    (fileName) => !artifactIsPresent(join(destDir, fileName)),
  );
  if (pending.length === 0) {
    return destDir;
  }

  const tag = readZkSdkVersion(projectRoot);
  const token = githubToken();
  console.log(
    `BEGIN vendor zk artifacts v${tag} -> ${destDir} (${pending.join(", ")})`,
  );
  let githubError;
  try {
    await downloadFromGithubRelease({
      destDir,
      files: pending,
      tag,
      token,
    });
  } catch (error) {
    githubError = error instanceof Error ? error.message : String(error);
    for (const fileName of pending) {
      const tempPath = join(destDir, `${fileName}.tmp`);
      if (existsSync(tempPath)) {
        unlinkSync(tempPath);
      }
    }
  }

  const stillMissing = copyFromLocalCircuits(projectRoot, destDir, pending);
  if (stillMissing.length === 0) {
    console.log("END vendor zk artifacts");
    return destDir;
  }

  const hint = token
    ? githubError
    : "No GH_TOKEN/GITHUB_TOKEN and `gh auth token` failed. Authenticate with gh or set a token for the private contracts repo.";
  throw new Error(
    `Missing ZK artifacts in ${destDir}: ${stillMissing.join(", ")}. GitHub v${tag}: ${hint}`,
  );
}

const isMain =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
  const env = { ...process.env };
  applyDotEnv(projectRoot, env);
  await vendorZkArtifacts({ projectRoot, env });
}
