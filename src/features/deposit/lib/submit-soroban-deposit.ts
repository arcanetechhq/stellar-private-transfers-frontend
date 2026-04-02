import { Buffer } from "buffer";
import { Client as PrivacyPoolContractClient } from "contract";
import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit/sdk";
import type { CoinData } from "@auditable/privacy-pool-zk-sdk";
import { privacyPoolService } from "@/shared/lib/privacy-pool/privacy-pool-service";
import { getDefaultStellarNetworkConfig } from "@/shared/stellar/stellar-network-environment";

function hexToBuffer(hex: string): Buffer {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  return Buffer.from(clean, "hex");
}

export interface SubmitSorobanDepositInput {
  contractId: string;
  walletPublicKey: string;
  stealthAddressStpl1: string;
  coin: CoinData;
  depositScalarHex: string;
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
  const contractClient = (await PrivacyPoolContractClient.from({
    contractId: input.contractId,
    networkPassphrase: passphrase,
    rpcUrl,
    allowHttp: true,
    publicKey: input.walletPublicKey,
    signTransaction: (xdrInput, options) =>
      StellarWalletsKit.signTransaction(xdrInput, {
        networkPassphrase: options?.networkPassphrase ?? passphrase,
        address: options?.address ?? input.walletPublicKey,
      }),
  })) as InstanceType<typeof PrivacyPoolContractClient>;

  const merkleTx = await contractClient.get_merkle_root();
  const merkleRootBuffer = merkleTx.result;

  const { proof_hex, public_hex } =
    await privacyPoolService.prepareDepositTransactProof({
      stealthAddressStpl1: input.stealthAddressStpl1,
      coin: input.coin,
      depositScalarHex: input.depositScalarHex,
      merkleRootBytes: merkleRootBuffer,
    });

  const assembledTransaction = await contractClient.transact({
    from: input.walletPublicKey,
    proof_bytes: hexToBuffer(proof_hex),
    pub_signals_bytes: hexToBuffer(public_hex),
    encoded: Buffer.from(input.encoded),
  });

  const sentTransaction = await assembledTransaction.signAndSend();
  const transactionHash = sentTransaction.sendTransactionResponse?.hash ?? "";
  if (!transactionHash) {
    throw new Error("Transaction failed");
  }
  return transactionHash;
}
