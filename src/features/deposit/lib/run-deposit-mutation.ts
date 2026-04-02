import {
  sealAndEncryptTransaction,
  type ITransaction,
} from "@auditable/stellar-audit";
import type { PostCoinDeliveryBody } from "@/entities/coin-deliveries";
import type { AppDispatch } from "@/app/store";
import { addCoin } from "@/entities/coin";
import type { AssetWithTrustline } from "@/entities/asset";
import { privacyPoolService } from "@/shared/lib/privacy-pool/privacy-pool-service";
import { normalizeSorobanContractId } from "@/shared/stellar/normalize-soroban-contract-id";
import { getAuditPublicKey, decimalFieldToBytes } from "./audit-encoding";
import { submitSorobanDeposit } from "./submit-soroban-deposit";
import { buildCoinDeliveryPostBody } from "./build-coin-delivery-post-body";

const STROOPS_PER_UNIT = 10_000_000;

function displayAmountToStroops(amount: number): bigint {
  return BigInt(Math.round(amount * STROOPS_PER_UNIT));
}

export interface RunDepositMutationInput {
  asset: AssetWithTrustline;
  amountDisplay: number;
  stealthAddress: string;
  walletPublicKey: string;
  networkPassphrase: string;
  sorobanRpcUrl: string;
}

export interface RunDepositMutationResult {
  txId: string;
  commitmentHex: string;
  assetId: string;
  poolContract: string;
  amountDisplay: number;
}

interface RunDepositMutationContext {
  dispatch: AppDispatch;
  postCoinDelivery: (body: PostCoinDeliveryBody) => {
    unwrap: () => Promise<unknown>;
  };
}

export async function runDepositMutation(
  context: RunDepositMutationContext,
  input: RunDepositMutationInput,
): Promise<RunDepositMutationResult> {
  const poolRaw = input.asset.poolContract?.trim();
  if (!poolRaw) {
    throw new Error("Asset has no pool contract");
  }
  const poolContract = normalizeSorobanContractId(poolRaw);
  const stealth = input.stealthAddress.trim();
  if (!stealth) {
    throw new Error("Stealth address required");
  }

  const amountStroops = displayAmountToStroops(input.amountDisplay);
  const { commitment_hex, coin, depositScalarHex } =
    await privacyPoolService.createAlignedShieldCoinData(
      stealth,
      amountStroops,
    );

  const auditPublicKey = getAuditPublicKey();
  const auditTx: ITransaction = {
    deposit1: {
      receiver: stealth,
      value: Number(coin.value),
      secret: decimalFieldToBytes(coin.secret),
      nullifier: decimalFieldToBytes(coin.nullifier),
    },
  };
  const encoded = await sealAndEncryptTransaction(auditTx, auditPublicKey);

  const txId = await submitSorobanDeposit({
    contractId: poolContract,
    walletPublicKey: input.walletPublicKey,
    stealthAddressStpl1: stealth,
    coin,
    depositScalarHex,
    encoded,
    networkPassphrase: input.networkPassphrase,
    sorobanRpcUrl: input.sorobanRpcUrl,
  });

  context.dispatch(
    addCoin({
      commitmentHex: commitment_hex,
      coin,
      depositScalarHex,
      stealthAddress: stealth,
      assetId: input.asset.assetId,
      poolContract,
      amountDisplay: input.amountDisplay,
      status: "pending",
      txId,
    }),
  );

  try {
    const body = await buildCoinDeliveryPostBody({
      recipientStealthStpl1: stealth,
      commitmentHex: commitment_hex,
      coin,
      depositScalarHex,
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
