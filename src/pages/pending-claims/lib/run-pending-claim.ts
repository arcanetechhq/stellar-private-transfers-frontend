import {
  sealAndEncryptTransaction,
  type ITransaction,
} from "@auditable/stellar-audit";
import type { AssetDto } from "@/entities/asset";
import { addCoin, type CoinData } from "@/entities/coin";
import { addTransaction, buildUserTransaction } from "@/entities/transaction";
import type { PendingClaimItem } from "@/entities/pending-claims";
import type { AppDispatch } from "@/store";
import { coinDeliveryApi } from "@/entities/coin-deliveries";
import {
  buildAuditDepositLeg,
  buildAuditWithdrawLeg,
} from "@/shared/lib/audit/build-audit-transaction-leg";
import { resolveAuditPrecommitementHex } from "@/shared/lib/audit/resolve-audit-precommitement-hex";
import { prepareConfidentialTransferProof } from "@/shared/lib/privacy-pool/privacy-pool-confidential-proofs";
import {
  fetchAndMergeMerkleState,
  readLeafEphemeralHex,
} from "@/shared/lib/privacy-pool/fetch-contract-merkle";
import { submitSorobanConfidentialTransfer } from "@/shared/lib/privacy-pool/submit-soroban-confidential-transfer";
import { getRequiredPrivacyPoolContractId } from "@/shared/stellar/stellar-network-environment";
import { resolveTokenContractId } from "@/shared/stellar/resolve-token-contract-id";
import {
  buildCoinDeliveryPostBody,
  getAuditPublicKey,
  toAuditNumber,
} from "@/features/deposit";
import {
  base64RecoveryScalar,
  buildClaimOnboardingPayload,
  claimToCoin,
} from "./pending-claim-payload";
import {
  baseUnitsToDisplayNumber,
  waitForClaimTransactionSuccess,
} from "./pending-claim-confirmation";

const FIELD_HEX_LENGTH = 64;
const ZERO_PRECOMMITMENT_HEX = "0".repeat(FIELD_HEX_LENGTH);
const MISSING_INDEX = -1;

type PendingClaimRunParameters = {
  dispatch: AppDispatch;
  claim: PendingClaimItem;
  asset: AssetDto;
  walletPublicKey: string;
  permanentPrivateAddress: string;
  networkPassphrase: string;
  sorobanRpcUrl: string;
};

async function loadClaimMerkleContext(parameters: {
  poolContract: string;
  walletPublicKey: string;
  networkPassphrase: string;
  sorobanRpcUrl: string;
  coin: CoinData;
}): Promise<{
  commitments: string[];
  ephemeral: { xHex: string; yHex: string };
}> {
  const { commitments } = await fetchAndMergeMerkleState({
    poolContractId: parameters.poolContract,
    walletPublicKey: parameters.walletPublicKey,
    networkPassphrase: parameters.networkPassphrase,
    sorobanRpcUrl: parameters.sorobanRpcUrl,
  });
  const leafIndex = commitments.indexOf(parameters.coin.commitment);
  if (leafIndex === MISSING_INDEX) {
    throw new Error("Pending claim commitment was not found in the pool");
  }
  const ephemeral = await readLeafEphemeralHex({
    poolContractId: parameters.poolContract,
    walletPublicKey: parameters.walletPublicKey,
    leafIndex,
    networkPassphrase: parameters.networkPassphrase,
    sorobanRpcUrl: parameters.sorobanRpcUrl,
  });
  return { commitments, ephemeral };
}

async function prepareClaimProof(parameters: {
  run: PendingClaimRunParameters;
  coin: CoinData;
  tokenContract: string;
  commitments: string[];
  ephemeral: { xHex: string; yHex: string };
}) {
  return prepareConfidentialTransferProof({
    coin: parameters.coin,
    state: { commitments: parameters.commitments },
    senderGAddress: parameters.run.walletPublicKey.trim(),
    senderPrivKeyScalarHex: base64RecoveryScalar(
      parameters.run.claim.encryptedRecoveryBase64,
    ),
    depositorEphemeralXHex: parameters.ephemeral.xHex,
    depositorEphemeralYHex: parameters.ephemeral.yHex,
    transferStroops: BigInt(parameters.coin.value),
    recipientPrivateAddressStpl1: parameters.run.permanentPrivateAddress.trim(),
    selfPrivateAddressStpl1ForChange: undefined,
    tokenAddress: parameters.tokenContract,
  });
}

async function submitClaimTransaction(parameters: {
  run: PendingClaimRunParameters;
  poolContract: string;
  tokenContract: string;
  coin: CoinData;
  prepared: Awaited<ReturnType<typeof prepareConfidentialTransferProof>>;
}): Promise<string> {
  const permanentPrivateAddress = parameters.run.permanentPrivateAddress.trim();
  const auditTx = {
    withdraw1: buildAuditWithdrawLeg({
      value: toAuditNumber(BigInt(parameters.coin.value), "Claim amount"),
      precommitementHex: ZERO_PRECOMMITMENT_HEX,
      nullifierDecimal: parameters.coin.nullifier,
      tokenAddress: parameters.tokenContract,
    }),
    deposit1: buildAuditDepositLeg(permanentPrivateAddress, {
      value: toAuditNumber(BigInt(parameters.coin.value), "Claim amount"),
      precommitementHex: resolveAuditPrecommitementHex(
        parameters.prepared.recipientCoin.precommitementHex,
        "deposit1",
      ),
      nullifierDecimal: parameters.prepared.recipientCoin.coin.nullifier,
      tokenAddress: parameters.tokenContract,
    }),
  } as unknown as ITransaction;
  return submitSorobanConfidentialTransfer({
    contractId: parameters.poolContract,
    walletPublicKey: parameters.run.walletPublicKey,
    proofHex: parameters.prepared.proof_hex,
    publicHex: parameters.prepared.public_hex,
    encoded: await sealAndEncryptTransaction(auditTx, getAuditPublicKey()),
    onboarding: buildClaimOnboardingPayload({
      claim: parameters.run.claim,
      privateAddressStpl1: permanentPrivateAddress,
    }),
    networkPassphrase: parameters.run.networkPassphrase,
    sorobanRpcUrl: parameters.run.sorobanRpcUrl,
  });
}

function storeClaimedCoin(parameters: {
  run: PendingClaimRunParameters;
  poolContract: string;
  txId: string;
  prepared: Awaited<ReturnType<typeof prepareConfidentialTransferProof>>;
}): void {
  parameters.run.dispatch(
    addCoin({
      commitmentHex: parameters.prepared.recipientCoin.commitment_hex,
      coin: parameters.prepared.recipientCoin.coin,
      depositScalarHex: parameters.prepared.recipientCoin.depositScalarHex,
      precommitementHex: parameters.prepared.recipientCoin.precommitementHex,
      privateAddress: parameters.run.permanentPrivateAddress.trim(),
      assetId: parameters.run.asset.assetId,
      poolContract: parameters.poolContract,
      amountDisplay: baseUnitsToDisplayNumber(
        parameters.prepared.recipientCoin.coin.value,
        parameters.run.asset.decimals,
      ),
      status: "pending",
      txId: parameters.txId,
    }),
  );
}

async function postClaimCoinDelivery(parameters: {
  run: PendingClaimRunParameters;
  txId: string;
  prepared: Awaited<ReturnType<typeof prepareConfidentialTransferProof>>;
}): Promise<void> {
  const body = await buildCoinDeliveryPostBody({
    recipientPrivateAddressStpl1: parameters.run.permanentPrivateAddress,
    commitmentHex: parameters.prepared.recipientCoin.commitment_hex,
    coin: parameters.prepared.recipientCoin.coin,
    depositScalarHex: parameters.prepared.recipientCoin.depositScalarHex,
    precommitementHex: parameters.prepared.recipientCoin.precommitementHex,
    assetId: parameters.run.asset.assetId,
    amountDisplay: baseUnitsToDisplayNumber(
      parameters.prepared.recipientCoin.coin.value,
      parameters.run.asset.decimals,
    ),
    txId: parameters.txId,
  });
  await parameters.run.dispatch(
    coinDeliveryApi.endpoints.postCoinDelivery.initiate(body),
  ).unwrap();
}

function recordClaimTransaction(parameters: {
  run: PendingClaimRunParameters;
  txId: string;
  amountDisplay: number;
}): void {
  parameters.run.dispatch(
    addTransaction(
      buildUserTransaction({
        txId: parameters.txId,
        type: "received",
        assetId: parameters.run.asset.assetId,
        amount: parameters.amountDisplay,
        counterparty: parameters.run.claim.ownerAddress,
        senderPrivateAddress: parameters.run.permanentPrivateAddress.trim(),
      }),
    ),
  );
}

export async function runPendingClaim(
  parameters: PendingClaimRunParameters,
): Promise<string> {
  const tokenContract = resolveTokenContractId(parameters.asset.clientContract);
  const poolContract = getRequiredPrivacyPoolContractId();
  const coin = claimToCoin(parameters.claim);
  const merkle = await loadClaimMerkleContext({
    poolContract,
    walletPublicKey: parameters.walletPublicKey,
    networkPassphrase: parameters.networkPassphrase,
    sorobanRpcUrl: parameters.sorobanRpcUrl,
    coin,
  });
  const prepared = await prepareClaimProof({
    run: parameters,
    coin,
    tokenContract,
    commitments: merkle.commitments,
    ephemeral: merkle.ephemeral,
  });
  const txId = await submitClaimTransaction({
    run: parameters,
    poolContract,
    tokenContract,
    coin,
    prepared,
  });
  await waitForClaimTransactionSuccess({
    txId,
    sorobanRpcUrl: parameters.sorobanRpcUrl,
  });
  const amountDisplay = baseUnitsToDisplayNumber(
    prepared.recipientCoin.coin.value,
    parameters.asset.decimals,
  );
  storeClaimedCoin({ run: parameters, poolContract, txId, prepared });
  recordClaimTransaction({ run: parameters, txId, amountDisplay });
  try {
    await postClaimCoinDelivery({ run: parameters, txId, prepared });
  } catch {
    await Promise.resolve();
  }
  return txId;
}
