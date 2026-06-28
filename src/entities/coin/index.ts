export type {
  CoinData,
  CoinEntry,
  CoinStatus,
  CoinWithMetadata,
  AggregatedPrivateAssetRow,
} from "./model/coin";

export {
  coinReducer,
  hydrateCoinState,
  addCoin,
  finalizeCoin,
  markCoinSpent,
  resetCoinState,
  selectCoinItems,
  selectCoinsByPrivateAddress,
  selectPrivateAddressesWithCoins,
  selectFinalizedAggregatesForPrivateAddress,
  type CoinState,
  type CoinRootState,
} from "./model/coin-slice";

export { normalizeCommitmentHex, loadCoinState, saveCoinState } from "./lib/persist-coin";

export { existingSpentCoinMatchesIncomingDelivery } from "./lib/ledger-commitment";

export { findCommitmentLeafIndex } from "./lib/find-commitment-leaf-index";

export {
  CONFIDENTIAL_SPEND_INPUT_LIMIT,
  CONFIDENTIAL_SPEND_OUTPUT_LIMIT,
  pickPrivateSpendCoins,
} from "./lib/private-spend-coin-selection";

export { withZeroAmountPrivateAssetRows } from "./lib/private-asset-aggregates";

