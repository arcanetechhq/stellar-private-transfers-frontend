import { PrivacyPoolSDK, DEFAULT_STEALTH_SIGN_NONCE } from "@auditable/privacy-pool-zk-sdk";
import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit/sdk";
import { fetchAndMergeMerkleState } from "@/shared/lib/privacy-pool/fetch-contract-merkle";
import { displayAmountToStroops } from "@/shared/lib/stellar/stroops";
import { normalizeSorobanContractId } from "@/shared/stellar/normalize-soroban-contract-id";
import { stealthAddressesEqual } from "./confidential-transfer-audit-helpers";
import type {
  RunConfidentialTransferInput,
  RunConfidentialTransferResult,
} from "./confidential-transfer-mutation-types";
import { pickCoinsForTransfer } from "@/entities/coin";
import { runDualCoinConfidentialBranch } from "./run-dual-coin-confidential-branch";
import { runSingleCoinConfidentialBranch } from "./run-single-coin-confidential-branch";

export type {
  RunConfidentialTransferInput,
  RunConfidentialTransferResult,
} from "./confidential-transfer-mutation-types";

export async function runConfidentialTransferMutation(
  input: RunConfidentialTransferInput,
): Promise<RunConfidentialTransferResult> {
  const poolContract = normalizeSorobanContractId(input.poolContractRaw.trim());
  const recipientTrim = input.recipientStealthStpl1.trim();
  const senderTrim = input.senderStealthAddress.trim();
  if (stealthAddressesEqual(recipientTrim, senderTrim)) {
    throw new Error("Recipient must differ from sender stealth address");
  }
  const transferStroops = displayAmountToStroops(input.amountDisplay);
  const picked = pickCoinsForTransfer({
    finalizedCoins: input.finalizedCoinsForSenderAndAsset,
    transferStroops,
  });

  const { commitments } = await fetchAndMergeMerkleState({
    poolContractId: poolContract,
    walletPublicKey: input.walletPublicKey,
    networkPassphrase: input.networkPassphrase,
    sorobanRpcUrl: input.sorobanRpcUrl,
  });
  const state = { commitments };

  const signMessageText = PrivacyPoolSDK.buildStealthAddressSignMessage(
    input.walletPublicKey.trim(),
    DEFAULT_STEALTH_SIGN_NONCE,
  );
  const { networkPassphrase } = await StellarWalletsKit.getNetwork();
  const { signedMessage } = await StellarWalletsKit.signMessage(signMessageText, {
    address: input.walletPublicKey.trim(),
    networkPassphrase,
  });

  const branchParameters = {
    input,
    poolContract,
    transferStroops,
    commitments,
    state,
    signedMessage,
    recipientTrim,
    senderTrim,
    picked,
  };

  if (picked.length === 1) {
    return runSingleCoinConfidentialBranch(branchParameters);
  }
  if (picked.length === 2) {
    return runDualCoinConfidentialBranch(branchParameters);
  }
  throw new Error("Unsupported coin selection count");
}
