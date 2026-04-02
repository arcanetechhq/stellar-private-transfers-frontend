import { Asset, TransactionBuilder, Operation, type Horizon } from "@stellar/stellar-sdk";
import { STELLAR_NETWORK_PASSPHRASE } from "./horizon-server";

const TRANSACTION_FEE = "100";
const TRANSACTION_TIMEOUT = 180;

interface ChangeTrustParameters {
  server: Horizon.Server;
  publicKey: string;
  assetCode: string;
  issuerAddress: string;
}

export async function buildChangeTrustTx(
  parameters: ChangeTrustParameters,
): Promise<string> {
  const { server, publicKey, assetCode, issuerAddress } = parameters;
  const account = await server.loadAccount(publicKey);
  const asset = new Asset(assetCode, issuerAddress);

  const transaction = new TransactionBuilder(account, {
    fee: TRANSACTION_FEE,
    networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
  })
    .addOperation(Operation.changeTrust({ asset }))
    .setTimeout(TRANSACTION_TIMEOUT)
    .build();

  return transaction.toXDR();
}
