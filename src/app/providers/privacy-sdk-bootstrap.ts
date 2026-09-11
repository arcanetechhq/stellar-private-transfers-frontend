import {
  configurePrivacyPoolService,
  createDefaultTransactEngine,
  createPrivacyPoolService,
  createStellarPolicyAdapterFromEnvironment,
  createStellarPrivacyClientFromResolvedConfig,
  getPrivacyPoolService,
  isStellarPrivacyClient,
  loadDefaultStellarBrowserAssets,
  resolveStellarPrivacyClientConfig,
  type StellarBrowserPrivacyClientConfig,
  type StellarPrivacyClient,
} from "@arcanetech/privacy-sdk-stellar";
import { wrapTransactEngineToProveAtPrepare } from "@/shared/lib/privacy-sdk/wrap-transact-engine.js";
import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit/sdk";
import {
  parseAuditPublicKeyFromEnvHex,
  type PrivacyPoolService,
  type StellarTransactEnvironment,
} from "@arcanetech/privacy-sdk-stellar/transact";
import {
  buildStellarTransactEnvironment,
  readAuditPublicKeyHexFromEnvironment,
} from "@/shared/lib/privacy-sdk/build-transact-environment.js";
import {
  attachPrivacyTransactRuntimeResolverProxies,
  setPrivacyTransactContext,
} from "@/shared/lib/privacy-sdk/transact-context.js";

async function createWalletAdapter(networkPassphrase: string) {
  return {
    getAddress: async () => {
      const { address } = await StellarWalletsKit.getAddress();
      return address;
    },
    authorizeMessage: async (message: Uint8Array | string) => {
      const payload =
        typeof message === "string"
          ? message
          : new TextDecoder().decode(message);
      const { signedMessage } = await StellarWalletsKit.signMessage(payload, {
        networkPassphrase,
      });
      return new TextEncoder().encode(signedMessage);
    },
    signTransactionPayload: async (payload: {
      operationId: string;
      signed: boolean;
    }) => payload,
  };
}

function resolveConfiguredPrivacyPoolService(
  assets: Awaited<ReturnType<typeof loadDefaultStellarBrowserAssets>>,
  transactEnvironment: StellarTransactEnvironment,
): PrivacyPoolService {
  try {
    return getPrivacyPoolService() as unknown as PrivacyPoolService;
  } catch {
    const service = createPrivacyPoolService({
      assets,
      applicationId: transactEnvironment.network.applicationId,
      auditPublicKey:
        transactEnvironment.auditPublicKey ??
        parseAuditPublicKeyFromEnvHex(readAuditPublicKeyHexFromEnvironment()),
      ...(transactEnvironment.zkConfigNonce === undefined
        ? {}
        : { zkConfigNonce: transactEnvironment.zkConfigNonce }),
      ...(transactEnvironment.zkArtifactBaseUrl === undefined
        ? {}
        : { zkArtifactBaseUrl: transactEnvironment.zkArtifactBaseUrl }),
    });
    configurePrivacyPoolService(service);
    return service as unknown as PrivacyPoolService;
  }
}

async function initializePrivacySdkClient(
  stateAdapter: StellarBrowserPrivacyClientConfig["state"],
  assets: Awaited<ReturnType<typeof loadDefaultStellarBrowserAssets>>,
) {
  const transactEnvironment = attachPrivacyTransactRuntimeResolverProxies(
    buildStellarTransactEnvironment(),
  );
  const resolved = await resolveStellarPrivacyClientConfig(
    {
      network: transactEnvironment.network,
      wallet: await createWalletAdapter(
        transactEnvironment.network.networkPassphrase,
      ),
      state: stateAdapter,
      assets,
      auditPublicKeyHex: readAuditPublicKeyHexFromEnvironment(),
      transactEnvironment,
      policy: createStellarPolicyAdapterFromEnvironment(transactEnvironment),
    },
    async (input) => {
      const engine = await createDefaultTransactEngine(
        input.assets,
        input.transactEnvironment,
      );
      if (!input.transactEnvironment) {
        return engine;
      }
      return wrapTransactEngineToProveAtPrepare({
        engine,
        environment: input.transactEnvironment,
        poolService: getPrivacyPoolService() as unknown as PrivacyPoolService,
      });
    },
  );
  if (!resolved.ok) {
    throw new Error("Privacy SDK client rejected during initialization.");
  }
  const engineTransactEnvironment = resolved.config.transactEnvironment;
  if (!engineTransactEnvironment) {
    throw new Error(
      "Privacy SDK transact environment is missing after resolve.",
    );
  }
  attachPrivacyTransactRuntimeResolverProxies(engineTransactEnvironment);
  const created = createStellarPrivacyClientFromResolvedConfig(resolved.config);
  if (!isStellarPrivacyClient(created)) {
    throw new Error("Privacy SDK client rejected during initialization.");
  }
  const privacyPoolService = resolveConfiguredPrivacyPoolService(
    assets,
    engineTransactEnvironment,
  );
  setPrivacyTransactContext({
    transactEnvironment: engineTransactEnvironment,
    client: created,
    privacyPoolService,
  });
  return created;
}

export async function bootstrapPrivacySdkClient(
  stateAdapter: StellarBrowserPrivacyClientConfig["state"],
): Promise<StellarPrivacyClient> {
  const assets = await loadDefaultStellarBrowserAssets();
  return initializePrivacySdkClient(stateAdapter, assets);
}
