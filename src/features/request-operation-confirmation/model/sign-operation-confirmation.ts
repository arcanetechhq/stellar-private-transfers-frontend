import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit/sdk";
import { OperationConfirmationRequestError } from "../api/operation-confirmation-api";

export async function signOperationConfirmation(input: {
  challenge: string;
  address: string;
}): Promise<string> {
  const { networkPassphrase } = await StellarWalletsKit.getNetwork();
  const signed = await StellarWalletsKit.signMessage(input.challenge, {
    address: input.address,
    networkPassphrase,
  });
  if (typeof signed.signedMessage !== "string" || signed.signedMessage.length === 0) {
    throw new OperationConfirmationRequestError();
  }
  return signed.signedMessage;
}
