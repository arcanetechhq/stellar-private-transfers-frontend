import React, { useMemo } from "react";
import { useAppSelector } from "@/store";
import { useGetAssetsQuery } from "@/entities/asset";
import { selectPrivateAddressState } from "@/entities/private-address";
import { selectWalletPublicKey } from "@/entities/wallet";
import {
  usePollAssetDeliveries,
  useSpentNullifierPolling,
} from "@/features/poll-coin-deliveries";
import { getRequiredPrivacyPoolContractId } from "@/shared/stellar/stellar-network-environment";

interface AssetPollerProperties {
  privateAddress: string;
  recipientScalarHex: string;
  assetId: string;
  poolContract: string;
}

function AssetPoller({
  privateAddress,
  recipientScalarHex,
  assetId,
  poolContract,
}: AssetPollerProperties) {
  usePollAssetDeliveries({
    privateAddress,
    recipientScalarHex,
    assetId,
    poolContract,
  });
  return <></>;
}

export function PollAllAssetDeliveries() {
  useSpentNullifierPolling();
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

  if (!publicKey || !assets || pollerTargets.length === 0) {
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
            poolContract={poolContract}
          />
        )),
      )}
    </>
  );
}
