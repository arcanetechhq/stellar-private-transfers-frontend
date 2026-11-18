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
import { FireblocksWizardError } from "./fireblocks-wizard-error";
import { readFireblocksSession } from "./fireblocks-session";
import { readSigningKey } from "./fireblocks-signing-key";
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

function publishCustodianAddress(dispatch: AppDispatch, address: string): void {
  bindSessionToPaymentAddress(address);
  rememberKitActiveAddress(address);
  dispatch(setPublicKey(address));
  dispatch(setWalletProviderName(FIREBLOCKS_WALLET_PROVIDER));
  dispatch(setPaymentCatalog("native-xlm"));
}

export async function openCustodianXlmSession(input: {
  wallet: StellarAssetWallet;
  dispatch: AppDispatch;
}): Promise<void> {
  if (!isFireblocksTestXlm(input.wallet)) {
    return;
  }
  const projectId = requireProjectId();
  await requireStoredCustodian();
  const session = startSilentStellarSession(projectId);
  const walletConnectUri = await session.walletConnectUri;
  await approveWalletConnectSession({
    vaultId: input.wallet.vaultId,
    walletConnectUri,
  });
  await session.approved;
  await assertNativeXlmCatalog(input.dispatch);
  publishCustodianAddress(input.dispatch, input.wallet.address);
}
