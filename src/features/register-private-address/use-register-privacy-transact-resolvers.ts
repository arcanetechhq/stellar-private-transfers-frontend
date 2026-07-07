import { useEffect } from "react";
import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit/sdk";
import { useAppSelector } from "@/store";
import { assetApi, type AssetDto } from "@/entities/asset";
import { selectWalletPublicKey } from "@/entities/wallet";
import {
  buildTransferOnboardingAtExecute,
  resolveTransferRecipientAtExecute,
} from "@/shared/lib/privacy-sdk/resolve-transfer-recipient-at-execute.js";
import {
  registerPrivacyTransactRuntimeResolvers,
  type PrivacyTransactRuntimeResolvers,
} from "@/shared/lib/privacy-sdk/transact-context.js";
import { resolveTokenContractId } from "@/shared/stellar/resolve-token-contract-id.js";

interface RuntimeResolverParameters {
  assets: AssetDto[] | undefined;
  walletPublicKey: string | undefined;
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
    buildTransferOnboardingAtExecute,
    resolveTokenContractId: (assetId) => {
      const asset = parameters.assets?.find((entry) => entry.assetId === assetId);
      if (!asset?.clientContract) {
        throw new Error(`Missing token contract for asset ${assetId}.`);
      }
      return resolveTokenContractId(asset.clientContract);
    },
  };
}

export function useRegisterPrivacyTransactResolvers(): void {
  const walletPublicKey = useAppSelector(selectWalletPublicKey);
  const { data: assets } = assetApi.useGetAssetsQuery();

  useEffect(() => {
    registerPrivacyTransactRuntimeResolvers(createRuntimeResolvers({
      assets,
      walletPublicKey,
    }));
  }, [assets, walletPublicKey]);
}
