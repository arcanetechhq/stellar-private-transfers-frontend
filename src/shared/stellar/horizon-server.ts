import { Horizon } from "@stellar/stellar-sdk";
import { getDefaultStellarNetworkConfig } from "./stellar-network-environment";

const defaults = getDefaultStellarNetworkConfig();

export const STELLAR_NETWORK_PASSPHRASE = defaults.networkPassphrase;
export const HORIZON_URL = defaults.horizonUrl;

export const horizonServer = new Horizon.Server(HORIZON_URL);
