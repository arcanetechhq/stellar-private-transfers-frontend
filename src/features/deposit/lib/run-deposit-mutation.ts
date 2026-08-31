import type { AppDispatch } from "@/store";
import type { AssetWithTrustline } from "@/entities/asset";
import { addCoin } from "@/entities/coin";
import {
  buildCoinItemFromSdkDeposit,
  prepareSdkDeposit,
} from "@/shared/lib/privacy-sdk/execute-sdk-deposit.js";
import { displayAmountToStroops } from "@/shared/lib/stellar/stroops.js";
import { getRequiredPrivacyPoolContractId } from "@/shared/stellar/stellar-network-environment";
import { routePreparedTransact } from "@/shared/lib/protocol-relay";
import { bindDepositRelayPorts } from "./bind-deposit-relay-ports.js";
import type { DepositTransactionResult } from "../model/deposit-transaction-types.js";

export async function runDepositMutation(input: {
  dispatch: AppDispatch;
  asset: AssetWithTrustline;
  amountDisplay: number;
  privateAddress: string;
  walletPublicKey: string;
}): Promise<DepositTransactionResult> {
  const poolContract = getRequiredPrivacyPoolContractId();
  const privateAddress = input.privateAddress.trim();
  if (!privateAddress) {
    throw new Error("Private address required");
  }
  const preparedOperation = await prepareSdkDeposit({
    walletPublicKey: input.walletPublicKey,
    privateAddress,
    assetId: input.asset.assetId,
    amountStroops: displayAmountToStroops(input.amountDisplay),
  });
  const routed = await routePreparedTransact({
    ports: bindDepositRelayPorts({
      dispatch: input.dispatch,
      execute: async () => {
        const receipt = await preparedOperation.execute();
        return { operationId: receipt.operationId };
      },
    }),
    walletPublicKey: input.walletPublicKey,
    prepared: preparedOperation.prepared,
    display: {
      kind: "deposit",
      assetId: input.asset.assetId,
      amountDisplay: input.amountDisplay,
      counterparty: input.walletPublicKey,
      senderPrivateAddress: privateAddress,
    },
  });
  const coinItem = buildCoinItemFromSdkDeposit({
    prepared: preparedOperation.prepared,
    privateAddress,
    assetId: input.asset.assetId,
    poolContract,
    txId: routed.txId,
  });
  input.dispatch(addCoin(coinItem));
  return {
    txId: routed.txId,
    commitmentHex: coinItem.commitmentHex,
    assetId: input.asset.assetId,
    poolContract,
    amountDisplay: input.amountDisplay,
  };
}
