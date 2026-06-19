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
  NUMBER_OF_CONFIDENTIAL_TRANSFER_INPUTS,
  NUMBER_OF_CONFIDENTIAL_WITHDRAW_INPUTS,
  NUMBER_OF_DEPOSITS,
  pickCoinsForTransfer,
  pickFinalizedCoinsForConfidentialSpend,
  pickSingleCoinForPrivateWithdraw,
} from "./lib/confidential-finalized-coin-pick";
