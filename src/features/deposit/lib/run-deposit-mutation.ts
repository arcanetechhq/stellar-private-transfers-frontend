import {
  sealAndEncryptTransaction,
  type ITransaction,
} from "@auditable/stellar-audit";
import type { PostCoinDeliveryBody } from "@/entities/coin-deliveries";
import type { AppDispatch } from "@/store";
import { addCoin } from "@/entities/coin";
import type { AssetWithTrustline } from "@/entities/asset";
import { privacyPoolService } from "@/shared/lib/privacy-pool/privacy-pool-service";
import { getRequiredPrivacyPoolContractId } from "@/shared/stellar/stellar-network-environment";
import {
  buildCoinDeliveryPostBody,
  getAuditPublicKey,
  submitSorobanDeposit,
  toAuditNumber,
} from "@/features/deposit";
import { resolveTokenContractId } from "@/shared/stellar/resolve-token-contract-id";
import { buildAuditDepositLeg } from "@/shared/lib/audit/build-audit-transaction-leg";
import { resolveAuditPrecommitementHex } from "@/shared/lib/audit/resolve-audit-precommitement-hex";

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
  const poolContract = getRequiredPrivacyPoolContractId();
  const stealth = input.stealthAddress.trim();
  if (!stealth) {
    throw new Error("Stealth address required");
  }

  const amountStroops = displayAmountToStroops(input.amountDisplay);
  const tokenContract = resolveTokenContractId(input.asset.clientContract);
  const { commitment_hex, coin, depositScalarHex, precommitementHex } =
    await privacyPoolService.createAlignedShieldCoinData({
      stealthAddressStpl1: stealth,
      amountStroops,
      tokenAddress: tokenContract,
    });

  const auditPublicKey = getAuditPublicKey();
  const auditTx = {
    deposit1: buildAuditDepositLeg(stealth, {
      value: toAuditNumber(BigInt(coin.value), "Deposit amount"),
      precommitementHex: resolveAuditPrecommitementHex(
        precommitementHex,
        "deposit1",
      ),
      nullifierDecimal: coin.nullifier,
      tokenAddress: tokenContract,
    }),
  } as unknown as ITransaction;
  const encoded = await sealAndEncryptTransaction(auditTx, auditPublicKey);

  const txId = await submitSorobanDeposit({
    contractId: poolContract,
    walletPublicKey: input.walletPublicKey,
    stealthAddressStpl1: stealth,
    coin,
    depositScalarHex,
    tokenAddress: tokenContract,
    encoded,
    networkPassphrase: input.networkPassphrase,
    sorobanRpcUrl: input.sorobanRpcUrl,
  });

  context.dispatch(
    addCoin({
      commitmentHex: commitment_hex,
      coin,
      depositScalarHex,
      precommitementHex,
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
