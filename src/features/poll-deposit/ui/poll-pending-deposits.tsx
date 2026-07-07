import { useEffect } from "react";
import { usePrivacySdkClient } from "@/app/providers/privacy-sdk-provider";
import { store, useAppDispatch, useAppSelector, type AppDispatch } from "@/store";
import { finalizeCoin, type CoinWithMetadata } from "@/entities/coin";

const POLL_INTERVAL_MS = 3000;

interface PollPendingContext {
  client: NonNullable<ReturnType<typeof usePrivacySdkClient>["client"]>;
  items: CoinWithMetadata[];
  dispatch: AppDispatch;
}

async function pollPendingItems(context: PollPendingContext): Promise<void> {
  const { client, items, dispatch } = context;
  for (const item of items) {
    if (!item.txId) {
      continue;
    }
    try {
      const status = await client.fetchTransactionConfirmationStatus(item.txId);
      if (status.status === "success") {
        dispatch(finalizeCoin(item.commitmentHex));
      }
    } catch {
      Promise.resolve().catch(() => {});
    }
  }
}

function usePollPendingDeposits(): void {
  const dispatch = useAppDispatch();
  const { client, ready } = usePrivacySdkClient();
  const pendingCount = useAppSelector((state) =>
    state.coin.items.filter(
      (item) => item.status === "pending" && Boolean(item.txId),
    ).length,
  );

  useEffect(() => {
    if (pendingCount === 0 || !ready || !client) {
      return;
    }

    const intervalId = setInterval(() => {
      const currentPending = store
        .getState()
        .coin.items.filter(
          (item) => item.status === "pending" && Boolean(item.txId),
        );
      void pollPendingItems({
        client,
        items: currentPending,
        dispatch,
      });
    }, POLL_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
    };
  }, [client, dispatch, pendingCount, ready]);
}

export function PollPendingDeposits() {
  usePollPendingDeposits();
}
