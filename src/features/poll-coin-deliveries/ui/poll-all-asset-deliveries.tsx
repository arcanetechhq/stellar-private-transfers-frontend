import React, { useMemo } from "react";
import { useAppSelector } from "@/app/hooks";
import { useGetAssetsQuery } from "@/entities/asset";
import { selectStealthState } from "@/entities/stealth-address";
import { selectWalletPublicKey } from "@/entities/wallet";
import { usePollAssetDeliveries } from "../model/use-poll-asset-deliveries";
import { useSpentNullifierPolling } from "../model/use-spent-nullifier-polling";

interface AssetPollerProperties {
  stealthAddress: string;
  recipientScalarHex: string;
  assetId: string;
  poolContract: string;
}

function AssetPoller({
  stealthAddress,
  recipientScalarHex,
  assetId,
  poolContract,
}: AssetPollerProperties) {
  usePollAssetDeliveries({
    stealthAddress,
    recipientScalarHex,
    assetId,
    poolContract,
  });
  return <></>;
}

export function PollAllAssetDeliveries() {
  useSpentNullifierPolling();
  const publicKey = useAppSelector(selectWalletPublicKey);
  const { byNonce, scalarByNonce } = useAppSelector(selectStealthState);
  const { data: assets } = useGetAssetsQuery();

  const pollerTargets = useMemo(() => {
    const entries: { nonceKey: string; stealthAddress: string; scalarHex: string }[] = [];
    const nonces = Object.keys(byNonce).toSorted();
    for (const nonceKey of nonces) {
      const entry = byNonce[nonceKey];
      const scalarHex = scalarByNonce[nonceKey];
      if (entry?.stealthAddress && scalarHex) {
        entries.push({
          nonceKey,
          stealthAddress: entry.stealthAddress,
          scalarHex,
        });
      }
    }
    return entries;
  }, [byNonce, scalarByNonce]);

  if (!publicKey || !assets || pollerTargets.length === 0) {
    return <></>;
  }

  const poolAssets = assets.filter((asset) => asset.poolContract !== null);

  return (
    <>
      {pollerTargets.flatMap((target) =>
        poolAssets.map((asset) => (
          <AssetPoller
            key={`${target.nonceKey}:${asset.assetId}`}
            stealthAddress={target.stealthAddress}
            recipientScalarHex={target.scalarHex}
            assetId={asset.assetId}
            poolContract={asset.poolContract as string}
          />
        )),
      )}
    </>
  );
}
