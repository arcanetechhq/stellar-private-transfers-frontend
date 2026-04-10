import { useEffect, useMemo, type ReactNode } from "react";
import { useAppSelector } from "@/store";
import { selectCoinItems } from "@/entities/coin";
import { selectWalletPublicKey } from "@/entities/wallet";
import { fetchAndMergeMerkleState } from "@/shared/lib/privacy-pool/fetch-contract-merkle";
import { getDefaultStellarNetworkConfig } from "@/shared/stellar/stellar-network-environment";

const SYNC_INTERVAL_MS = 90_000;

export function MerkleTreeSyncProvider({
  children,
}: {
  children: ReactNode;
}) {
  const walletPublicKey = useAppSelector(selectWalletPublicKey);
  const coinItems = useAppSelector(selectCoinItems);
  const pools = useMemo(() => {
    const unique = new Set<string>();
    for (const item of coinItems) {
      const pool = item.poolContract?.trim();
      if (pool) {
        unique.add(pool);
      }
    }
    return [...unique];
  }, [coinItems]);
  const { sorobanRpcUrl, networkPassphrase } = getDefaultStellarNetworkConfig();

  useEffect(() => {
    const key = walletPublicKey?.trim();
    if (!key || pools.length === 0) {
      return;
    }
    let cancelled = false;
    const syncAll = async () => {
      for (const poolContractId of pools) {
        if (cancelled) {
          return;
        }
        try {
          await fetchAndMergeMerkleState({
            poolContractId,
            walletPublicKey: key,
            networkPassphrase,
            sorobanRpcUrl,
          });
        } catch {
          // NOTE: background best-effort sync; errors are non-fatal.
        }
      }
    };
    void syncAll();
    const intervalId = globalThis.setInterval(syncAll, SYNC_INTERVAL_MS);
    return () => {
      cancelled = true;
      globalThis.clearInterval(intervalId);
    };
  }, [walletPublicKey, networkPassphrase, sorobanRpcUrl, pools]);

  return children;
}
