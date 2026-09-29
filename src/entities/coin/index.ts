export type {
  CoinData,
  CoinEntry,
  CoinStatus,
  DeadOnArrivalReason,
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

export {
  formatLargestFinalizedNoteBalanceInput,
  formatMaxWithdrawBalanceInput,
  getLargestFinalizedNoteStroops,
  getMaxWithdrawStroops,
} from "./lib/largest-finalized-note-balance";
