export type {
  CoinData,
  CoinEntry,
  CoinStatus,
  CoinWithMetadata,
  AggregatedPrivateAssetRow,
} from "./model/coin";

export {
  coinReducer,
  addCoin,
  finalizeCoin,
  markCoinSpent,
  resetCoinState,
  selectCoinItems,
  selectCoinsByPrivateAddress,
  selectFirstPrivateAddressWithFinalizedCoins,
  selectPrivateAddressesWithCoins,
  selectFinalizedAggregatesForPrivateAddress,
  type CoinState,
  type CoinRootState,
} from "./model/coin-slice";
export { coinSdkSyncMiddleware } from "./model/coin-sdk-sync-middleware.js";
export {
  syncCoinItemsToSdkState,
  upsertPrivateRecordToSdkState,
} from "./lib/sync-private-records-to-sdk.js";

export { normalizeCommitmentHex } from "./lib/persist-coin";
export {
  mapPrivateRecordsToCoinItems,
  mapPrivateRecordToCoinWithMetadata,
} from "./lib/map-private-records-to-coins.js";

export { existingSpentCoinMatchesIncomingDelivery } from "./lib/ledger-commitment";

export { findCommitmentLeafIndex } from "./lib/find-commitment-leaf-index";

export {
  CONFIDENTIAL_SPEND_INPUT_LIMIT,
  CONFIDENTIAL_SPEND_OUTPUT_LIMIT,
  pickPrivateSpendCoins,
} from "./lib/private-spend-coin-selection";

export { withZeroAmountPrivateAssetRows } from "./lib/private-asset-aggregates";
