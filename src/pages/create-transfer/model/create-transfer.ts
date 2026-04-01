export interface MockToken {
  id: string;
  name: string;
  ticker: string;
  icon: string;
  balance: number;
  price: number;
}

export const mockTokens: MockToken[] = [
  {
    id: "usdc",
    name: "USD Coin",
    ticker: "USDC",
    icon: "💵",
    balance: 45_250,
    price: 1,
  },
  {
    id: "usdt",
    name: "Tether",
    ticker: "USDT",
    icon: "💲",
    balance: 12_800,
    price: 1,
  },
  {
    id: "eth",
    name: "Ethereum",
    ticker: "ETH",
    icon: "⟠",
    balance: 8.35,
    price: 2450,
  },
  {
    id: "dai",
    name: "Dai Stablecoin",
    ticker: "DAI",
    icon: "◈",
    balance: 5600,
    price: 1,
  },
  {
    id: "wbtc",
    name: "Wrapped Bitcoin",
    ticker: "WBTC",
    icon: "₿",
    balance: 0.42,
    price: 43_500,
  },
  {
    id: "paxg",
    name: "Paxos Gold",
    ticker: "PAXG",
    icon: "🪙",
    balance: 3.7,
    price: 1950,
  },
];

export const mockPercentageDivisor = 100;
export const mockQuickPercentageQuarter = 25;
export const mockQuickPercentageHalf = 50;
export const mockQuickPercentageThreeQuarters = 75;
export const mockQuickPercentageOptions = [
  mockQuickPercentageQuarter,
  mockQuickPercentageHalf,
  mockQuickPercentageThreeQuarters,
] as const;
export const mockRecipientPrefixLength = 6;
export const mockRecipientSuffixLength = -4;
export const networkFee = 0.25;
