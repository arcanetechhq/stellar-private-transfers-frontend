import { useEffect } from "react";
import { useAppSelector } from "@/store";
import { readConnectedWalletAddress } from "@/shared/lib/wallet/read-connected-wallet-address";
import { assetApi, type AssetDto } from "@/entities/asset";
import { selectWalletPublicKey } from "@/entities/wallet";
import { resolveTransferRecipientAtExecute } from "@/shared/lib/privacy-sdk/resolve-transfer-recipient-at-execute.js";
import {
  registerPrivacyTransactRuntimeResolvers,
  type PrivacyTransactRuntimeResolvers,
} from "@/shared/lib/privacy-sdk/transact-context.js";
import { resolveTokenContractId } from "@/shared/stellar/resolve-token-contract-id.js";

interface RuntimeResolverParameters {
  assets: AssetDto[] | undefined;
  walletPublicKey: string | undefined;
  ensureWalletScalar: (privateAddressStpl1?: string) => Promise<string>;
}

function catalogClientContract(
  assets: AssetDto[] | undefined,
  assetId: string,
): string | undefined {
  return assets?.find(
    (entry) =>
      entry.assetId === assetId || entry.clientContract === assetId,
  )?.clientContract;
}

function resolveRuntimeTokenContract(
  assets: AssetDto[] | undefined,
  assetId: string,
): string {
  const fromCatalog = catalogClientContract(assets, assetId);
  if (fromCatalog) {
    return resolveTokenContractId(fromCatalog);
  }
  return resolveTokenContractId(assetId);
}

function createRuntimeResolvers(
  parameters: RuntimeResolverParameters,
): PrivacyTransactRuntimeResolvers {
  return {
    resolveWalletPublicKey: async () => {
      const connected = parameters.walletPublicKey?.trim();
      if (connected) {
        return connected;
      }
      return readConnectedWalletAddress();
    },
    resolveTransferRecipientAtExecute,
    ensureSenderPrivKeyScalarHex: (privateAddressStpl1) =>
      parameters.ensureWalletScalar(privateAddressStpl1),
    resolveTokenContractId: (assetId) =>
      resolveRuntimeTokenContract(parameters.assets, assetId),
  };
}

export function useRegisterPrivacyTransactResolvers(parameters: {
  ensureWalletScalar: (privateAddressStpl1?: string) => Promise<string>;
}): void {
  const walletPublicKey = useAppSelector(selectWalletPublicKey);
  const { data: assets } = assetApi.useGetAssetsQuery();
  const ensureWalletScalar = parameters.ensureWalletScalar;

  useEffect(() => {
    registerPrivacyTransactRuntimeResolvers(createRuntimeResolvers({
      assets,
      walletPublicKey,
      ensureWalletScalar,
    }));
  }, [assets, ensureWalletScalar, walletPublicKey]);
}
