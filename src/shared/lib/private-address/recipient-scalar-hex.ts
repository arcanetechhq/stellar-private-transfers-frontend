import { spendScalarHexFromStellarSignature } from "@arcanetech/privacy-sdk-stellar/transact";
import type { SpendScalarDomain } from "@arcanetech/privacy-sdk-stellar/transact";

export async function recipientScalarHexFromStellarSignature(
  signature: string,
  domain: SpendScalarDomain,
): Promise<string> {
  return spendScalarHexFromStellarSignature(signature, domain);
}
