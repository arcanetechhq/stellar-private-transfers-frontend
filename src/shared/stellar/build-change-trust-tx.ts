import { Asset, TransactionBuilder, Operation, type Horizon } from "@stellar/stellar-sdk";

const TRANSACTION_FEE = "100";
const TRANSACTION_TIMEOUT = 180;

interface ChangeTrustParameters {
  server: Horizon.Server;
  publicKey: string;
  assetCode: string;
  issuerAddress: string;
  networkPassphrase: string;
}

export async function buildChangeTrustTx(
  parameters: ChangeTrustParameters,
): Promise<string> {
  const { server, publicKey, assetCode, issuerAddress, networkPassphrase } =
    parameters;
  const account = await server.loadAccount(publicKey);
  const asset = new Asset(assetCode, issuerAddress);

  const transaction = new TransactionBuilder(account, {
    fee: TRANSACTION_FEE,
    networkPassphrase,
  })
    .addOperation(Operation.changeTrust({ asset }))
    .setTimeout(TRANSACTION_TIMEOUT)
    .build();

  return transaction.toXDR();
}
