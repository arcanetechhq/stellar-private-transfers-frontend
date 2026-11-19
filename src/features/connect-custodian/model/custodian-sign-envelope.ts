import { xdr } from "@stellar/stellar-sdk";

const RESOURCE_EXT = "resourceExt";
const NETWORK_WRITE_BYTE_LIMIT = 132_096;

export function envelopeForCustodianSigning(xdrText: string): string {
  try {
    const envelope = xdr.TransactionEnvelope.fromXDR(xdrText, "base64");
    if (envelope.switch().name !== "envelopeTypeTx") {
      return xdrText;
    }
    const transaction = envelope.v1().tx();
    if (transaction.ext().arm() !== "sorobanData") {
      return xdrText;
    }
    const data = transaction.ext().sorobanData();
    let changed = false;
    if (data.ext().arm() === RESOURCE_EXT) {
      data.ext(new xdr.SorobanTransactionDataExt(0));
      changed = true;
    }
    if (data.resources().writeBytes() > NETWORK_WRITE_BYTE_LIMIT) {
      data.resources().writeBytes(NETWORK_WRITE_BYTE_LIMIT);
      changed = true;
    }
    return changed ? envelope.toXDR("base64") : xdrText;
  } catch {
    return xdrText;
  }
}
