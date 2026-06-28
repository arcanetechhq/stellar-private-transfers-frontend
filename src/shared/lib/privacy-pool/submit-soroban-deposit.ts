import type { CoinData } from "@auditable/privacy-pool-zk-sdk";
import { createPoolContractClient } from "@/shared/stellar/create-pool-contract-client";
import { getDefaultStellarNetworkConfig } from "@/shared/stellar/stellar-network-environment";
import { privacyPoolService } from "./privacy-pool-service";
import { requestKytPassageForPoolInteraction } from "./kyt-passage-inspect";
import { submitPoolTransact } from "./submit-pool-transact";

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
  return submitPoolTransact({
    contractClient,
    from: input.walletPublicKey,
    proofHex: proof_hex,
    publicHex: public_hex,
    approval,
  });
}
