import type { AppDispatch } from "@/store";
import { assetApi, isNativeCatalogXlm } from "@/entities/asset";
import {
  FIREBLOCKS_WALLET_PROVIDER,
  setPaymentCatalog,
  setPublicKey,
  setWalletProviderName,
} from "@/entities/wallet";
import { rememberKitActiveAddress } from "@/shared/lib/wallet/remember-kit-active-address";
import { approveWalletConnectSession } from "../api/fireblocks-web3-connection";
import type { StellarAssetWallet } from "../api/fireblocks-asset-wallets";
import { bindSessionToPaymentAddress } from "./custodian-signing-session";
import {
  beginCustodianIntent,
  isCurrentCustodianIntent,
} from "./custodian-intent";
import { closeCustodianWalletConnectTopic } from "./close-wallet-connect-session";
import { dropPreviousCustodianPrivateData } from "./drop-previous-custodian-private-data";
import { FireblocksWizardError } from "./fireblocks-wizard-error";
import { readFireblocksSession } from "./fireblocks-session";
import { readSigningKey, storeSigningKey } from "./fireblocks-signing-key";
import { saveSelectedFireblocksAsset } from "./selected-fireblocks-asset";
import {
  readReownProjectId,
  startSilentStellarSession,
} from "./silent-stellar-session";

const XLM_TEST_ASSET_ID = "XLM_TEST";
const STELLAR_ADDRESS_PREFIX = "G";

export function isFireblocksTestXlm(wallet: StellarAssetWallet): boolean {
  return (
    wallet.assetId === XLM_TEST_ASSET_ID &&
    wallet.address.startsWith(STELLAR_ADDRESS_PREFIX)
  );
}

function requireProjectId(): string {
  const projectId = readReownProjectId();
  if (!projectId) {
    throw new FireblocksWizardError("walletconnect-unconfigured");
  }
  return projectId;
}

async function requireStoredCustodian(): Promise<void> {
  const session = readFireblocksSession();
  const signingKey = await readSigningKey();
  if (!session || !signingKey) {
    throw new FireblocksWizardError("key-store");
  }
}

async function assertNativeXlmCatalog(dispatch: AppDispatch): Promise<void> {
  const query = dispatch(assetApi.endpoints.getAssets.initiate());
  try {
    const assets = await query.unwrap();
    if (!assets.some((asset) => isNativeCatalogXlm(asset))) {
      throw new FireblocksWizardError("catalog-mismatch");
    }
  } catch (error: unknown) {
    if (error instanceof FireblocksWizardError) {
      throw error;
    }
    throw new FireblocksWizardError("catalog-mismatch");
  } finally {
    query.unsubscribe();
  }
}

function publishCustodianAddress(
  dispatch: AppDispatch,
  wallet: StellarAssetWallet,
): void {
  const address = wallet.address.trim();
  bindSessionToPaymentAddress(address);
  rememberKitActiveAddress(address);
  dispatch(setPublicKey(address));
  dispatch(setWalletProviderName(FIREBLOCKS_WALLET_PROVIDER));
  dispatch(setPaymentCatalog("native-xlm"));
  saveSelectedFireblocksAsset(wallet);
}

async function approveSilentSession(input: {
  wallet: StellarAssetWallet;
  projectId: string;
}): Promise<string> {
  const session = startSilentStellarSession(input.projectId);
  const walletConnectUri = await session.walletConnectUri;
  await approveWalletConnectSession({
    vaultId: input.wallet.vaultId,
    walletConnectUri,
  });
  return session.approved;
}

async function restoreReplacedSigningKey(
  replacedPrevious: boolean,
  signingKey: CryptoKey | undefined,
): Promise<void> {
  if (!replacedPrevious || signingKey === undefined) {
    return;
  }
  await storeSigningKey(signingKey);
}

async function approveOpenedSession(input: {
  token: number;
  projectId: string;
  wallet: StellarAssetWallet;
  dispatch: AppDispatch;
}): Promise<void> {
  const topic = await approveSilentSession({
    wallet: input.wallet,
    projectId: input.projectId,
  });
  if (await abandonStaleSession(input.token, topic)) {
    return;
  }
  await assertNativeXlmCatalog(input.dispatch);
  if (await abandonStaleSession(input.token, topic)) {
    return;
  }
  publishCustodianAddress(input.dispatch, input.wallet);
}

let openedSession: Promise<void> | undefined;

async function runOpenCustodianXlmSession(input: {
  wallet: StellarAssetWallet;
  dispatch: AppDispatch;
}): Promise<void> {
  if (!isFireblocksTestXlm(input.wallet)) {
    return;
  }
  const token = beginCustodianIntent();
  const projectId = requireProjectId();
  await requireStoredCustodian();
  const retainedSigningKey = await readSigningKey();
  let replacedPrevious = false;
  try {
    replacedPrevious = await dropPreviousCustodianPrivateData({
      dispatch: input.dispatch,
      nextAddress: input.wallet.address,
    });
    if (!isCurrentCustodianIntent(token)) {
      return;
    }
    await approveOpenedSession({
      token,
      projectId,
      wallet: input.wallet,
      dispatch: input.dispatch,
    });
  } finally {
    if (isCurrentCustodianIntent(token)) {
      await restoreReplacedSigningKey(replacedPrevious, retainedSigningKey);
    }
  }
}

export function openCustodianXlmSession(input: {
  wallet: StellarAssetWallet;
  dispatch: AppDispatch;
}): Promise<void> {
  if (openedSession) {
    return openedSession;
  }
  const pending = runOpenCustodianXlmSession(input).finally(() => {
    openedSession = undefined;
  });
  openedSession = pending;
  return pending;
}

async function abandonStaleSession(token: number, topic: string): Promise<boolean> {
  if (isCurrentCustodianIntent(token)) {
    return false;
  }
  await closeCustodianWalletConnectTopic(topic);
  return true;
}
