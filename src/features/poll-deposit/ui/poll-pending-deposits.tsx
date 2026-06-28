import { useEffect } from "react";
import { rpc } from "@stellar/stellar-sdk";
import { store, useAppDispatch, useAppSelector, type AppDispatch } from "@/store";
import { finalizeCoin, type CoinWithMetadata } from "@/entities/coin";
import { getDefaultStellarNetworkConfig } from "@/shared/stellar/stellar-network-environment";

const { sorobanRpcUrl: pollSorobanRpcUrl } = getDefaultStellarNetworkConfig();

const POLL_INTERVAL_MS = 3000;

interface PollPendingContext {
  server: rpc.Server;
  items: CoinWithMetadata[];
  dispatch: AppDispatch;
}

async function pollPendingItems(context: PollPendingContext): Promise<void> {
  const { server, items, dispatch } = context;
  for (const item of items) {
    try {
      const response = await server.getTransaction(item.txId!);
      if (response.status === "SUCCESS") {
        dispatch(finalizeCoin(item.commitmentHex));
      }
    } catch {
      Promise.resolve().catch(() => {});
    }
  }
}

function usePollPendingDeposits(): void {
  const dispatch = useAppDispatch();
  const pendingCount = useAppSelector((state) =>
    state.coin.items.filter(
      (item) => item.status === "pending" && Boolean(item.txId),
    ).length,
  );

  useEffect(() => {
    if (pendingCount === 0) {
      return;
    }

    const server = new rpc.Server(pollSorobanRpcUrl, {
      allowHttp: true,
    });

    const intervalId = setInterval(() => {
      const currentPending = store
        .getState()
        .coin.items.filter(
          (item) => item.status === "pending" && Boolean(item.txId),
        );
      void pollPendingItems({
        server,
        items: currentPending,
        dispatch,
      });
    }, POLL_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
    };
  }, [dispatch, pendingCount]);
}

export function PollPendingDeposits() {
  usePollPendingDeposits();
}
