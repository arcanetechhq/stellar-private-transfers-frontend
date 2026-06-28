import { useCallback, useState } from "react";
import { StellarWalletsKit as StellarWalletsKitSdk } from "@creit-tech/stellar-wallets-kit/sdk";
import {
  buildCoinDeliveryPostBody,
  usePostCoinDeliveryMutation,
  type PostCoinDeliveryBody,
} from "@/entities/coin-deliveries";
import type { AssetWithTrustline } from "@/entities/asset";
import { useAppDispatch, useAppSelector, type AppDispatch } from "@/store";
import { selectWalletPublicKey } from "@/entities/wallet";
import {
  getDefaultStellarNetworkConfig,
  getRequiredPrivacyPoolContractId,
} from "@/shared/stellar/stellar-network-environment";
import { addCoin } from "@/entities/coin";
import { privacyPoolService } from "@/shared/lib/privacy-pool/privacy-pool-service";
import { submitSorobanDeposit } from "@/shared/lib/privacy-pool/submit-soroban-deposit";
import { resolveTokenContractId } from "@/shared/stellar/resolve-token-contract-id";

export interface DepositTransactionInput {
  asset: AssetWithTrustline;
  amountDisplay: number;
  privateAddress: string;
}

const { sorobanRpcUrl: defaultSorobanRpcUrl } = getDefaultStellarNetworkConfig();
const STROOPS_PER_UNIT = 10_000_000;

function displayAmountToStroops(amount: number): bigint {
  return BigInt(Math.round(amount * STROOPS_PER_UNIT));
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
  networkPassphrase: string;
  sorobanRpcUrl: string;
}

interface RunDepositMutationContext {
  dispatch: AppDispatch;
  postCoinDelivery: (body: PostCoinDeliveryBody) => {
    unwrap: () => Promise<unknown>;
  };
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
  const tokenContract = resolveTokenContractId(input.asset.clientContract);
  const { commitment_hex, coin, depositScalarHex, precommitementHex } =
    await privacyPoolService.createAlignedShieldCoinData({
      privateAddressStpl1: privateAddress,
      amountStroops,
      tokenAddress: tokenContract,
    });

  const txId = await submitSorobanDeposit({
    contractId: poolContract,
    walletPublicKey: input.walletPublicKey,
    privateAddressStpl1: privateAddress,
    coin,
    depositScalarHex,
    tokenAddress: tokenContract,
    networkPassphrase: input.networkPassphrase,
    sorobanRpcUrl: input.sorobanRpcUrl,
  });

  context.dispatch(
    addCoin({
      commitmentHex: commitment_hex,
      coin,
      depositScalarHex,
      precommitementHex,
      privateAddress,
      assetId: input.asset.assetId,
      poolContract,
      amountDisplay: input.amountDisplay,
      status: "pending",
      txId,
    }),
  );

  try {
    const body = await buildCoinDeliveryPostBody({
      recipientPrivateAddressStpl1: privateAddress,
      commitmentHex: commitment_hex,
      coin,
      depositScalarHex,
      precommitementHex,
      assetId: input.asset.assetId,
      amountDisplay: input.amountDisplay,
      txId,
    });
    await context.postCoinDelivery(body).unwrap();
  } catch {
    await Promise.resolve();
  }

  return {
    txId,
    commitmentHex: commitment_hex,
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
