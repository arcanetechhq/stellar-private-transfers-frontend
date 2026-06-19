import { Buffer } from "buffer";
import type { CoinData } from "@auditable/privacy-pool-zk-sdk";
import { privacyPoolService } from "@/shared/lib/privacy-pool/privacy-pool-service";
import { runTtlPreflight } from "@/shared/lib/privacy-pool/ttl-preflight";
import { getDefaultStellarNetworkConfig } from "@/shared/stellar/stellar-network-environment";
import { createPoolContractClient } from "@/shared/stellar/create-pool-contract-client";

function hexToBuffer(hex: string): Buffer {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  return Buffer.from(clean, "hex");
}

export interface SubmitSorobanDepositInput {
  contractId: string;
  walletPublicKey: string;
  privateAddressStpl1: string;
  coin: CoinData;
  depositScalarHex: string;
  tokenAddress: string;
  encoded: Uint8Array;
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
  const contractClient = createPoolContractClient({
    contractId: input.contractId,
    walletPublicKey: input.walletPublicKey,
    networkPassphrase: passphrase,
    sorobanRpcUrl: rpcUrl,
  });

  const merkleTx = await contractClient.get_merkle_root();
  const merkleRootBuffer = merkleTx.result;

  const { proof_hex, public_hex } =
    await privacyPoolService.prepareDepositTransactProof({
      privateAddressStpl1: input.privateAddressStpl1,
      coin: input.coin,
      depositScalarHex: input.depositScalarHex,
      merkleRootBytes: merkleRootBuffer,
      tokenAddress: input.tokenAddress,
    });

  const assembledTransaction = await contractClient.transact({
    from: input.walletPublicKey,
    proof_bytes: hexToBuffer(proof_hex),
    pub_signals_bytes: hexToBuffer(public_hex),
    encoded: Buffer.from(input.encoded),
  });

  await runTtlPreflight(assembledTransaction);
  const sentTransaction = await assembledTransaction.signAndSend();
  const transactionHash = sentTransaction.sendTransactionResponse?.hash ?? "";
  if (!transactionHash) {
    throw new Error("Transaction failed");
  }
  return transactionHash;
}
