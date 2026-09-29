import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector, type AppDispatch } from "@/store";
import { selectCoinItems, type CoinWithMetadata } from "@/entities/coin";
import { selectWalletPublicKey } from "@/entities/wallet";
import { tryGetPrivacySdkClient } from "@/shared/lib/privacy-sdk/transact-context.js";
import { pollSpentNullifiersForCoins } from "./poll-spent-nullifiers.js";

const POLL_INTERVAL_MS = 3000;

async function runSpentCheckTick(parameters: {
  walletPublicKey: string;
  items: CoinWithMetadata[];
  dispatch: AppDispatch;
}): Promise<void> {
  const privacyClient = tryGetPrivacySdkClient();
  if (!privacyClient) {
    return;
  }
  await pollSpentNullifiersForCoins({
    walletPublicKey: parameters.walletPublicKey,
    items: parameters.items,
    dispatch: parameters.dispatch,
    checkSpendStatus: (input) =>
      privacyClient.checkPrivateRecordSpendStatus(input),
  });
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
