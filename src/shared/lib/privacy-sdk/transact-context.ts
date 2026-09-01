import type { StellarPrivacyClient } from "@arcanetech/privacy-sdk-stellar";
import {
  configurePrivacyPoolService,
  type BuildTransferOnboardingAtExecuteInput,
  type OnboardingPayload,
  type PrivacyPoolService,
  type StellarTransactEnvironment,
  type TransferRecipientExecutionContext,
} from "@arcanetech/privacy-sdk-stellar/transact";

let privacyPoolServiceInstance: PrivacyPoolService | undefined;
let transactEnvironment: StellarTransactEnvironment | undefined;
let privacyClient: StellarPrivacyClient | undefined;
let privacySdkBootstrapError: string | undefined;
const privacyPoolServiceReadyListeners = new Set<() => void>();

function notifyPrivacyPoolServiceReadyListeners(): void {
  for (const listener of privacyPoolServiceReadyListeners) {
    listener();
  }
}

export function subscribePrivacyPoolServiceConfigured(
  listener: () => void,
): () => void {
  privacyPoolServiceReadyListeners.add(listener);
  return () => {
    privacyPoolServiceReadyListeners.delete(listener);
  };
}

export function getPrivacyPoolServiceConfiguredSnapshot(): boolean {
  return privacyPoolServiceInstance !== undefined;
}

export function subscribePrivacySdkBootstrapError(
  listener: () => void,
): () => void {
  return subscribePrivacyPoolServiceConfigured(listener);
}

export function getPrivacySdkBootstrapErrorSnapshot(): string | undefined {
  return privacySdkBootstrapError;
}

export function setPrivacySdkBootstrapError(message: string | undefined): void {
  privacySdkBootstrapError = message;
  notifyPrivacyPoolServiceReadyListeners();
}

export interface PrivacyTransactRuntimeResolvers {
  resolveWalletPublicKey?: () => Promise<string>;
  resolveTokenContractId?: (assetId: string) => string | Promise<string>;
  resolveTransferRecipientAtExecute?: (input: {
    recipientStellarAddress: string;
    walletPublicKey: string;
  }) => Promise<TransferRecipientExecutionContext>;
  buildTransferOnboardingAtExecute?: (
    input: BuildTransferOnboardingAtExecuteInput,
  ) => Promise<OnboardingPayload>;
  ensureSenderPrivKeyScalarHex?: (
    privateAddressStpl1: string,
  ) => Promise<string>;
}

let transactRuntimeResolvers: PrivacyTransactRuntimeResolvers = {};

export function attachPrivacyTransactRuntimeResolverProxies(
  environment: StellarTransactEnvironment,
): StellarTransactEnvironment {
  if (transactRuntimeResolvers.resolveTokenContractId) {
    environment.resolveTokenContractId = (assetId) => {
      const resolver = transactRuntimeResolvers.resolveTokenContractId;
      if (!resolver) {
        throw new Error(
          `Token contract is not configured for asset ${assetId}.`,
        );
      }
      return resolver(assetId);
    };
  }
  if (transactRuntimeResolvers.resolveWalletPublicKey) {
    environment.resolveWalletPublicKey = () => {
      const resolver = transactRuntimeResolvers.resolveWalletPublicKey;
      if (!resolver) {
        throw new Error("Wallet public key resolver is not configured.");
      }
      return resolver();
    };
  }
  environment.resolveTransferRecipientAtExecute = (input) => {
    const resolver = transactRuntimeResolvers.resolveTransferRecipientAtExecute;
    if (!resolver) {
      throw new Error("Transfer recipient resolver is not configured.");
    }
    return resolver(input);
  };
  environment.buildTransferOnboardingAtExecute = (input) => {
    const resolver = transactRuntimeResolvers.buildTransferOnboardingAtExecute;
    if (!resolver) {
      throw new Error("Transfer onboarding builder is not configured.");
    }
    return resolver(input);
  };
  if (transactRuntimeResolvers.ensureSenderPrivKeyScalarHex) {
    environment.ensureSenderPrivKeyScalarHex = (privateAddressStpl1) => {
      const resolver = transactRuntimeResolvers.ensureSenderPrivKeyScalarHex;
      if (!resolver) {
        throw new Error("Sender private key scalar resolver is not configured.");
      }
      return resolver(privateAddressStpl1);
    };
  }
  return environment;
}

export function registerPrivacyTransactRuntimeResolvers(
  resolvers: PrivacyTransactRuntimeResolvers,
): void {
  transactRuntimeResolvers = {
    ...transactRuntimeResolvers,
    ...resolvers,
  };
  if (transactEnvironment) {
    attachPrivacyTransactRuntimeResolverProxies(transactEnvironment);
  }
}

export function setPrivacyPoolService(service: PrivacyPoolService): void {
  privacyPoolServiceInstance = service;
}

export function isPrivacyPoolServiceConfigured(): boolean {
  return privacyPoolServiceInstance !== undefined;
}

export function getConfiguredPrivacyPoolService(): PrivacyPoolService {
  if (!privacyPoolServiceInstance) {
    throw new Error("Privacy SDK pool service is not initialized.");
  }
  return privacyPoolServiceInstance;
}

export function setPrivacyTransactContext(input: {
  transactEnvironment: StellarTransactEnvironment;
  client: StellarPrivacyClient;
  privacyPoolService: PrivacyPoolService;
}): void {
  transactEnvironment = input.transactEnvironment;
  privacyClient = input.client;
  privacyPoolServiceInstance = input.privacyPoolService;
  privacySdkBootstrapError = undefined;
  configurePrivacyPoolService(input.privacyPoolService);
  registerPrivacyTransactRuntimeResolvers(transactRuntimeResolvers);
  notifyPrivacyPoolServiceReadyListeners();
}

export function clearPrivacyTransactContext(): void {
  transactEnvironment = undefined;
  privacyClient = undefined;
  privacyPoolServiceInstance = undefined;
  privacySdkBootstrapError = undefined;
  transactRuntimeResolvers = {};
  notifyPrivacyPoolServiceReadyListeners();
}

export function getPrivacyTransactEnvironment(): StellarTransactEnvironment {
  if (!transactEnvironment) {
    throw new Error("Privacy SDK is not initialized.");
  }
  return transactEnvironment;
}

export function getPrivacySdkClientOrThrow(): StellarPrivacyClient {
  if (!privacyClient) {
    throw new Error("Privacy SDK client is not initialized.");
  }
  return privacyClient;
}

export function tryGetPrivacySdkClient(): StellarPrivacyClient | undefined {
  return privacyClient;
}
