import { Networks } from "@stellar/stellar-sdk";
import { STELLAR_NETWORK_PASSPHRASE } from "@/shared/stellar/horizon-server";

export function isStellarTestnet(): boolean {
  return STELLAR_NETWORK_PASSPHRASE === Networks.TESTNET;
}
