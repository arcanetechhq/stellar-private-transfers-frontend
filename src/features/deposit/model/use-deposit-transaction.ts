import { useCallback, useState } from "react";
import { StellarWalletsKit as StellarWalletsKitSdk } from "@creit-tech/stellar-wallets-kit/sdk";
import { usePostCoinDeliveryMutation } from "@/entities/coin-deliveries";
import type { AssetWithTrustline } from "@/entities/asset";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { selectWalletPublicKey } from "@/entities/wallet";
import { getDefaultStellarNetworkConfig } from "@/shared/stellar/stellar-network-environment";
import { runDepositMutation } from "../lib/run-deposit-mutation";

export interface DepositTransactionInput {
  asset: AssetWithTrustline;
  amountDisplay: number;
  stealthAddress: string;
}

export type DepositTransactionResult = Awaited<
  ReturnType<typeof runDepositMutation>
>;

const { sorobanRpcUrl: defaultSorobanRpcUrl } = getDefaultStellarNetworkConfig();

export function useDepositTransaction() {
  const dispatch = useAppDispatch();
  const walletPublicKey = useAppSelector(selectWalletPublicKey);
  const [postCoinDelivery] = usePostCoinDeliveryMutation();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | undefined>();

  const mutateAsync = useCallback(
    async (
      input: DepositTransactionInput,
    ): Promise<DepositTransactionResult> => {
      setIsPending(true);
      setError(undefined);
      try {
        if (!walletPublicKey) {
          throw new Error("Wallet not connected");
        }
        const { networkPassphrase } = await StellarWalletsKitSdk.getNetwork();
        const result = await runDepositMutation(
          { dispatch, postCoinDelivery },
          {
            ...input,
            walletPublicKey,
            networkPassphrase,
            sorobanRpcUrl: defaultSorobanRpcUrl,
          },
        );
        return result;
      } catch (error_) {
        const nextError =
          error_ instanceof Error ? error_ : new Error(String(error_));
        setError(nextError);
        throw nextError;
      } finally {
        setIsPending(false);
      }
    },
    [dispatch, postCoinDelivery, walletPublicKey],
  );

  return { mutateAsync, isPending, error };
}
