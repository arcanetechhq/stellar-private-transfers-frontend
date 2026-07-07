import { useCallback, useState } from "react";
import {
  usePostCoinDeliveryMutation,
  type PostCoinDeliveryBody,
} from "@/entities/coin-deliveries";
import type { AssetWithTrustline } from "@/entities/asset";
import { useAppDispatch, useAppSelector, type AppDispatch } from "@/store";
import { selectWalletPublicKey } from "@/entities/wallet";
import { getRequiredPrivacyPoolContractId } from "@/shared/stellar/stellar-network-environment";
import { addCoin } from "@/entities/coin";
import {
  buildCoinItemFromSdkDeposit,
  executeSdkDeposit,
} from "@/shared/lib/privacy-sdk/execute-sdk-deposit.js";
import { displayAmountToStroops } from "@/shared/lib/stellar/stroops.js";
import { postDepositDelivery } from "./post-deposit-delivery.js";

export interface DepositTransactionInput {
  asset: AssetWithTrustline;
  amountDisplay: number;
  privateAddress: string;
}

export interface DepositTransactionResult {
  txId: string;
  commitmentHex: string;
  assetId: string;
  poolContract: string;
  amountDisplay: number;
}

interface RunDepositMutationInput extends DepositTransactionInput {
  walletPublicKey: string;
}

interface RunDepositMutationContext {
  dispatch: AppDispatch;
  postCoinDelivery: (body: PostCoinDeliveryBody) => {
    unwrap: () => Promise<unknown>;
  };
}

async function persistDepositResult(input: {
  assetId: string;
  context: RunDepositMutationContext;
  poolContract: string;
  prepared: Awaited<ReturnType<typeof executeSdkDeposit>>["prepared"];
  privateAddress: string;
  txId: string;
}): Promise<ReturnType<typeof buildCoinItemFromSdkDeposit>> {
  const coinItem = buildCoinItemFromSdkDeposit({
    prepared: input.prepared,
    privateAddress: input.privateAddress,
    assetId: input.assetId,
    poolContract: input.poolContract,
    txId: input.txId,
  });
  input.context.dispatch(addCoin(coinItem));
  await postDepositDelivery({
    coinItem,
    postCoinDelivery: input.context.postCoinDelivery,
  });
  return coinItem;
}

async function runDepositMutation(
  context: RunDepositMutationContext,
  input: RunDepositMutationInput,
): Promise<DepositTransactionResult> {
  const poolContract = getRequiredPrivacyPoolContractId();
  const privateAddress = input.privateAddress.trim();
  if (!privateAddress) {
    throw new Error("Private address required");
  }

  const amountStroops = displayAmountToStroops(input.amountDisplay);
  const { receipt, prepared } = await executeSdkDeposit({
    walletPublicKey: input.walletPublicKey,
    privateAddress,
    assetId: input.asset.assetId,
    amountStroops,
  });
  const txId = receipt.operationId;
  const coinItem = await persistDepositResult({
    assetId: input.asset.assetId,
    context,
    poolContract,
    prepared,
    privateAddress,
    txId,
  });

  return {
    txId,
    commitmentHex: coinItem.commitmentHex,
    assetId: input.asset.assetId,
    poolContract,
    amountDisplay: input.amountDisplay,
  };
}

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
        return await runDepositMutation(
          { dispatch, postCoinDelivery },
          {
            ...input,
            walletPublicKey,
          },
        );
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
