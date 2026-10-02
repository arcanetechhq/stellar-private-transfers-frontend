import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { selectCoinItems } from "@/entities/coin";
import {
  selectIsTagsHydrated,
  selectSeenTagsForAsset,
} from "@/entities/coin-deliveries";
import { selectTransactions } from "@/entities/transaction";
import { selectWalletPublicKey } from "@/entities/wallet";
import { readPrivateDataOriginFromEnvironment } from "@/shared/stellar/read-private-data-origin";
import { receiveOutputNotes } from "./receive-output-notes.js";

const POLL_INTERVAL_MS = 12_000;

export interface UsePollAssetDeliveriesParameters {
  privateAddress: string;
  recipientScalarHex: string;
  assetId: string;
  lookupAsset: string;
  poolContract: string;
  pollingEnabled?: boolean;
}

export function usePollAssetDeliveries({
  privateAddress,
  recipientScalarHex,
  assetId,
  lookupAsset,
  poolContract,
  pollingEnabled = true,
}: UsePollAssetDeliveriesParameters): void {
  const dispatch = useAppDispatch();
  const publicKey = useAppSelector(selectWalletPublicKey);
  const seenTags = useAppSelector(selectSeenTagsForAsset(assetId));
  const coinItems = useAppSelector(selectCoinItems);
  const isTagsHydrated = useAppSelector(selectIsTagsHydrated);
  const localTransactions = useAppSelector(selectTransactions);
  const origin = readPrivateDataOriginFromEnvironment();

  const canPoll =
    pollingEnabled &&
    Boolean(origin) &&
    Boolean(privateAddress) &&
    Boolean(lookupAsset) &&
    Boolean(recipientScalarHex) &&
    Boolean(publicKey) &&
    isTagsHydrated;

  useEffect(() => {
    if (!canPoll || !origin || !publicKey) {
      return undefined;
    }
    let stopped = false;
    const tick = () => {
      if (stopped) {
        return;
      }
      void receiveOutputNotes({
        origin,
        privateAddress,
        lookupAsset,
        recipientScalarHex,
        assetId,
        poolContract,
        publicKey,
        seenTags,
        coinItems,
        localTransactionIds: localTransactions.map(
          (transaction) => transaction.id,
        ),
        dispatch,
      });
    };
    tick();
    const timer = setInterval(tick, POLL_INTERVAL_MS);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [
    canPoll,
    origin,
    publicKey,
    privateAddress,
    lookupAsset,
    recipientScalarHex,
    assetId,
    poolContract,
    seenTags,
    coinItems,
    localTransactions,
    dispatch,
  ]);
}
