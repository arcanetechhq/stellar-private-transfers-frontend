import { useEffect, useRef } from "react";
import { Buffer } from "buffer";
import { Client as PrivacyPoolContractClient } from "contract";
import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit/sdk";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import type { AppDispatch } from "@/app/store";
import { markCoinSpent, selectCoinItems, type CoinWithMetadata } from "@/entities/coin";
import { selectWalletPublicKey } from "@/entities/wallet";
import { privacyPoolService } from "@/shared/lib/privacy-pool/privacy-pool-service";
import { getDefaultStellarNetworkConfig } from "@/shared/stellar/stellar-network-environment";

const POLL_INTERVAL_MS = 3000;

type PrivacyPoolClient = InstanceType<typeof PrivacyPoolContractClient>;

function hexToBuffer(hex: string): Buffer {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  return Buffer.from(clean, "hex");
}

function groupFinalizedByPool(items: CoinWithMetadata[]): Map<string, CoinWithMetadata[]> {
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

async function getOrCreatePoolClient(parameters: {
  poolContract: string;
  walletPublicKey: string;
  networkPassphrase: string;
  sorobanRpcUrl: string;
  clientsByPool: Map<string, PrivacyPoolClient>;
}): Promise<PrivacyPoolClient> {
  const cached = parameters.clientsByPool.get(parameters.poolContract);
  if (cached) {
    return cached;
  }
  const client = (await PrivacyPoolContractClient.from({
    contractId: parameters.poolContract,
    networkPassphrase: parameters.networkPassphrase,
    rpcUrl: parameters.sorobanRpcUrl,
    allowHttp: true,
    publicKey: parameters.walletPublicKey,
    signTransaction: (xdrInput, options) =>
      StellarWalletsKit.signTransaction(xdrInput, {
        networkPassphrase: options?.networkPassphrase ?? parameters.networkPassphrase,
        address: options?.address ?? parameters.walletPublicKey,
      }),
  })) as PrivacyPoolClient;
  parameters.clientsByPool.set(parameters.poolContract, client);
  return client;
}

async function isNullifierConsumedOnChain(parameters: {
  coin: CoinWithMetadata;
  contractClient: PrivacyPoolClient;
}): Promise<boolean> {
  const nullifierHashHex = await privacyPoolService.calculateNullifierHash(
    parameters.coin.coin.nullifier,
  );
  const nullifierHashBuffer = hexToBuffer(nullifierHashHex);
  const read = await parameters.contractClient.is_nulifier_hash_consumed({
    hash: nullifierHashBuffer,
  });
  return read.result as boolean;
}

async function runSpentCheckTick(parameters: {
  walletPublicKey: string;
  items: CoinWithMetadata[];
  clientsByPool: Map<string, PrivacyPoolClient>;
  networkPassphrase: string;
  sorobanRpcUrl: string;
  dispatch: AppDispatch;
}): Promise<void> {
  const byPool = groupFinalizedByPool(parameters.items);
  for (const [poolContract, coins] of byPool) {
    let client: PrivacyPoolClient;
    try {
      client = await getOrCreatePoolClient({
        poolContract,
        walletPublicKey: parameters.walletPublicKey,
        networkPassphrase: parameters.networkPassphrase,
        sorobanRpcUrl: parameters.sorobanRpcUrl,
        clientsByPool: parameters.clientsByPool,
      });
    } catch {
      continue;
    }
    for (const coinRow of coins) {
      try {
        const consumed = await isNullifierConsumedOnChain({
          coin: coinRow,
          contractClient: client,
        });
        if (consumed) {
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

  const clientsByPoolReference = useRef(new Map<string, PrivacyPoolClient>());

  useEffect(() => {
    clientsByPoolReference.current.clear();
  }, [publicKey]);

  useEffect(() => {
    if (!publicKey) {
      return;
    }
    const { networkPassphrase, sorobanRpcUrl } = getDefaultStellarNetworkConfig();

    const tick = () =>
      runSpentCheckTick({
        walletPublicKey: publicKeyReference.current ?? publicKey,
        items: coinItemsReference.current,
        clientsByPool: clientsByPoolReference.current,
        networkPassphrase,
        sorobanRpcUrl,
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
