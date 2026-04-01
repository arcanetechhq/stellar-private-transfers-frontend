export interface Token {
  id: string;
  name: string;
  ticker: string;
  balance: number;
  price: number;
}

export const mockTokens: Token[] = [
  {
    id: "usdc",
    name: "USD Coin",
    ticker: "USDC",
    balance: 50_000,
    price: 1,
  },
  {
    id: "usdt",
    name: "Tether",
    ticker: "USDT",
    balance: 25_000,
    price: 1,
  },
  {
    id: "eth",
    name: "Ethereum",
    ticker: "ETH",
    balance: 15.5,
    price: 2450,
  },
  {
    id: "dai",
    name: "Dai Stablecoin",
    ticker: "DAI",
    balance: 12_000,
    price: 1,
  },
  {
    id: "wbtc",
    name: "Wrapped Bitcoin",
    ticker: "WBTC",
    balance: 0.5,
    price: 43_500,
  },
  {
    id: "paxg",
    name: "Paxos Gold",
    ticker: "PAXG",
    balance: 2.5,
    price: 1950,
  },
];

export const PERCENTAGE_DIVISOR = 100;

const QUICK_PERCENTAGE_QUARTER = 25;
const QUICK_PERCENTAGE_HALF = 50;
const QUICK_PERCENTAGE_THREE_QUARTERS = 75;

export const QUICK_PERCENTAGE_OPTIONS = [
  QUICK_PERCENTAGE_QUARTER,
  QUICK_PERCENTAGE_HALF,
  QUICK_PERCENTAGE_THREE_QUARTERS,
] as const;

export const NETWORK_FEE = 2.5;
