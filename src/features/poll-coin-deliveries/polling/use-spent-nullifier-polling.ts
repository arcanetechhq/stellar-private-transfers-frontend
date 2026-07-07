import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector, type AppDispatch } from "@/store";
import { markCoinSpent, selectCoinItems, type CoinWithMetadata } from "@/entities/coin";
import { selectWalletPublicKey } from "@/entities/wallet";
import { tryGetPrivacySdkClient } from "@/shared/lib/privacy-sdk/transact-context.js";

const POLL_INTERVAL_MS = 3000;

function groupFinalizedByPool(
  items: CoinWithMetadata[],
): Map<string, CoinWithMetadata[]> {
  const map = new Map<string, CoinWithMetadata[]>();
  for (const item of items) {
    if (item.status !== "finalized") {
      continue;
    }
    const list = map.get(item.poolContract) ?? [];
    list.push(item);
    map.set(item.poolContract, list);
  }
  return map;
}

async function runSpentCheckTick(parameters: {
  walletPublicKey: string;
  items: CoinWithMetadata[];
  dispatch: AppDispatch;
}): Promise<void> {
  const privacyClient = tryGetPrivacySdkClient();
  if (!privacyClient) {
    return;
  }
  const byPool = groupFinalizedByPool(parameters.items);
  for (const [poolContract, coins] of byPool) {
    for (const coinRow of coins) {
      try {
        const { spent } = await privacyClient.checkPrivateRecordSpendStatus({
          poolContractId: poolContract,
          nullifier: coinRow.coin.nullifier,
          walletPublicKey: parameters.walletPublicKey,
        });
        if (spent) {
          parameters.dispatch(markCoinSpent(coinRow.coin.commitment));
        }
      } catch {
        continue;
      }
    }
  }
}

export function useSpentNullifierPolling(): void {
  const dispatch = useAppDispatch();
  const publicKey = useAppSelector(selectWalletPublicKey);
  const coinItems = useAppSelector(selectCoinItems);

  const coinItemsReference = useRef(coinItems);
  const publicKeyReference = useRef(publicKey);
  const dispatchReference = useRef(dispatch);
  coinItemsReference.current = coinItems;
  publicKeyReference.current = publicKey;
  dispatchReference.current = dispatch;

  useEffect(() => {
    if (!publicKey) {
      return;
    }

    const tick = () =>
      runSpentCheckTick({
        walletPublicKey: publicKeyReference.current ?? publicKey,
        items: coinItemsReference.current,
        dispatch: dispatchReference.current,
      });

    const intervalId = globalThis.setInterval(() => {
      void tick();
    }, POLL_INTERVAL_MS);

    void tick();

    return () => {
      globalThis.clearInterval(intervalId);
    };
  }, [publicKey]);
}
