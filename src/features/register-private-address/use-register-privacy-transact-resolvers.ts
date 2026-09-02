import { useEffect } from "react";
import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit/sdk";
import { useAppSelector } from "@/store";
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

function createRuntimeResolvers(
  parameters: RuntimeResolverParameters,
): PrivacyTransactRuntimeResolvers {
  return {
    resolveWalletPublicKey: async () => {
      const connected = parameters.walletPublicKey?.trim();
      if (connected) {
        return connected;
      }
      const { address } = await StellarWalletsKit.getAddress();
      return address;
    },
    resolveTransferRecipientAtExecute,
    ensureSenderPrivKeyScalarHex: (privateAddressStpl1) =>
      parameters.ensureWalletScalar(privateAddressStpl1),
    resolveTokenContractId: (assetId) => {
      const asset = parameters.assets?.find((entry) => entry.assetId === assetId);
      if (!asset?.clientContract) {
        throw new Error(`Missing token contract for asset ${assetId}.`);
      }
      return resolveTokenContractId(asset.clientContract);
    },
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
