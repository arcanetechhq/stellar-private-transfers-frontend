import { useMemo } from "react";
import { useAppSelector } from "@/store";
import { useGetAssetsQuery } from "@/entities/asset";
import { selectPrivateAddressState } from "@/entities/private-address";
import { selectWalletPublicKey } from "@/entities/wallet";
import { useWalletPrivateAddress } from "@/features/register-private-address";
import {
  usePollAssetDeliveries,
  useSpentNullifierPolling,
} from "../model";
import { getRequiredPrivacyPoolContractId } from "@/shared/stellar/stellar-network-environment";

interface AssetPollerProperties {
  privateAddress: string;
  recipientScalarHex: string;
  assetId: string;
  lookupAsset: string;
  poolContract: string;
  pollingEnabled: boolean;
}

function AssetPoller({
  privateAddress,
  recipientScalarHex,
  assetId,
  lookupAsset,
  poolContract,
  pollingEnabled,
}: AssetPollerProperties) {
  usePollAssetDeliveries({
    privateAddress,
    recipientScalarHex,
    assetId,
    lookupAsset,
    poolContract,
    pollingEnabled,
  });
  return <></>;
}

export function PollAllAssetDeliveries() {
  useSpentNullifierPolling();
  const { actionsEnabled } = useWalletPrivateAddress();
  const publicKey = useAppSelector(selectWalletPublicKey);
  const { byNonce, scalarByNonce } = useAppSelector(selectPrivateAddressState);
  const { data: assets } = useGetAssetsQuery();

  const pollerTargets = useMemo(() => {
    const entries: { nonceKey: string; privateAddress: string; scalarHex: string }[] = [];
    const nonces = Object.keys(byNonce).toSorted();
    for (const nonceKey of nonces) {
      const entry = byNonce[nonceKey];
      const scalarHex = scalarByNonce[nonceKey];
      if (entry?.privateAddress && scalarHex) {
        entries.push({
          nonceKey,
          privateAddress: entry.privateAddress,
          scalarHex,
        });
      }
    }
    return entries;
  }, [byNonce, scalarByNonce]);

  if (!publicKey || !assets || !actionsEnabled || pollerTargets.length === 0) {
    return <></>;
  }

  const poolContract = getRequiredPrivacyPoolContractId();

  return (
    <>
      {pollerTargets.flatMap((target) =>
        assets.map((asset) => (
          <AssetPoller
            key={`${target.nonceKey}:${asset.assetId}`}
            privateAddress={target.privateAddress}
            recipientScalarHex={target.scalarHex}
            assetId={asset.assetId}
            lookupAsset={asset.clientContract ?? asset.assetId}
            poolContract={poolContract}
            pollingEnabled={actionsEnabled}
          />
        )),
      )}
    </>
  );
}
