import { Horizon, Networks } from "@stellar/stellar-sdk";

export const STELLAR_NETWORK_PASSPHRASE = Networks.TESTNET;
export const HORIZON_URL = "https://horizon-testnet.stellar.org";

export const horizonServer = new Horizon.Server(HORIZON_URL);
