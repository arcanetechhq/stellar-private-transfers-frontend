import { Buffer } from "buffer";
import { decodePrivateAddress } from "@/shared/lib/private-address/privacy-pool-sdk-private-address";
import { createRegistryContractClient } from "@/shared/stellar/create-registry-contract-client";
import { runTtlPreflight } from "@/shared/lib/privacy-pool/ttl-preflight";

const COORDINATE_HEX_LENGTH = 64;

export async function registerPrivateAddressOnChain(parameters: {
  registryContractId: string;
  walletPublicKey: string;
  privateAddressStpl1: string;
  networkPassphrase: string;
  sorobanRpcUrl: string;
}): Promise<string> {
  const decoded = decodePrivateAddress(parameters.privateAddressStpl1.trim());
  const client = createRegistryContractClient({
    contractId: parameters.registryContractId,
    walletPublicKey: parameters.walletPublicKey,
    networkPassphrase: parameters.networkPassphrase,
    sorobanRpcUrl: parameters.sorobanRpcUrl,
  });
  const assembled = await client.register_private_address({
    owner: parameters.walletPublicKey,
    public_key_x: Buffer.from(decoded.x.padStart(COORDINATE_HEX_LENGTH, "0"), "hex"),
    public_key_y: Buffer.from(decoded.y.padStart(COORDINATE_HEX_LENGTH, "0"), "hex"),
  });
  await runTtlPreflight(assembled);
  const sent = await assembled.signAndSend();
  const transactionHash = sent.sendTransactionResponse?.hash ?? "";
  if (!transactionHash) {
    throw new Error("Registry registration transaction failed");
  }
  return transactionHash;
}
