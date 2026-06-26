import type { CoinData } from "@auditable/privacy-pool-zk-sdk";
import { privacyPoolService } from "@/shared/lib/privacy-pool/privacy-pool-service";
import { getDefaultStellarNetworkConfig } from "@/shared/stellar/stellar-network-environment";
import { createPoolContractClient } from "@/shared/stellar/create-pool-contract-client";
import {
  approvalSignatureToBytes,
  requestKytPassageForPoolInteraction,
} from "@/shared/lib/privacy-pool/kyt-passage-inspect";
import { runTtlPreflight } from "@/shared/lib/privacy-pool/ttl-preflight";

export interface SubmitSorobanDepositInput {
  contractId: string;
  walletPublicKey: string;
  privateAddressStpl1: string;
  coin: CoinData;
  depositScalarHex: string;
  tokenAddress: string;
  networkPassphrase?: string;
  sorobanRpcUrl?: string;
}

function resolveSorobanNetwork(input: SubmitSorobanDepositInput): {
  passphrase: string;
  rpcUrl: string;
} {
  const defaults = getDefaultStellarNetworkConfig();
  return {
    passphrase: input.networkPassphrase ?? defaults.networkPassphrase,
    rpcUrl: input.sorobanRpcUrl ?? defaults.sorobanRpcUrl,
  };
}

export async function submitSorobanDeposit(
  input: SubmitSorobanDepositInput,
): Promise<string> {
  const { passphrase, rpcUrl } = resolveSorobanNetwork(input);
  const merkleTx = await createPoolContractClient({
    contractId: input.contractId,
    walletPublicKey: input.walletPublicKey,
    networkPassphrase: passphrase,
    sorobanRpcUrl: rpcUrl,
  }).get_merkle_root();
  const merkleRootBuffer = merkleTx.result;

  const { applicationIdsPlaintext, proof_hex, public_hex } =
    await privacyPoolService.prepareDepositTransactProof({
      privateAddressStpl1: input.privateAddressStpl1,
      coin: input.coin,
      depositScalarHex: input.depositScalarHex,
      merkleRootBytes: merkleRootBuffer,
      tokenAddress: input.tokenAddress,
    });

  const approval = await requestKytPassageForPoolInteraction({
    owner: input.walletPublicKey,
    poolContract: input.contractId,
    proofHex: proof_hex,
    publicHex: public_hex,
    applicationIdsPlaintext,
    networkPassphrase: passphrase,
    sorobanRpcUrl: rpcUrl,
  });
  const contractClient = createPoolContractClient({
    contractId: input.contractId,
    walletPublicKey: input.walletPublicKey,
    networkPassphrase: passphrase,
    sorobanRpcUrl: rpcUrl,
  });
  const assembledTransaction = await contractClient.transact({
    from: input.walletPublicKey,
    proof_bytes: Buffer.from(proof_hex.replace(/^0x/i, ""), "hex"),
    pub_signals_bytes: Buffer.from(public_hex.replace(/^0x/i, ""), "hex"),
    onboarding: undefined,
    kyt_authorization: {
      expiration_ledger: approval.expiresAtLedger,
      signature: approvalSignatureToBytes(approval.signature),
    },
  });
  await runTtlPreflight(assembledTransaction);
  const sentTransaction = await assembledTransaction.signAndSend();
  const transactionHash = sentTransaction.sendTransactionResponse?.hash ?? "";
  if (!transactionHash) {
    throw new Error("Transaction failed");
  }
  return transactionHash;
}
