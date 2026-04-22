import React, { useMemo } from "react";
import { useAppSelector } from "@/store";
import { useGetAssetsQuery } from "@/entities/asset";
import { selectStealthState } from "@/entities/stealth-address";
import { selectWalletPublicKey } from "@/entities/wallet";
import {
  usePollAssetDeliveries,
  useSpentNullifierPolling,
} from "@/features/poll-coin-deliveries";
import { getRequiredPrivacyPoolContractId } from "@/shared/stellar/stellar-network-environment";

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

  const poolContract = getRequiredPrivacyPoolContractId();

  return (
    <>
      {pollerTargets.flatMap((target) =>
        assets.map((asset) => (
          <AssetPoller
            key={`${target.nonceKey}:${asset.assetId}`}
            stealthAddress={target.stealthAddress}
            recipientScalarHex={target.scalarHex}
            assetId={asset.assetId}
            poolContract={poolContract}
          />
        )),
      )}
    </>
  );
}
