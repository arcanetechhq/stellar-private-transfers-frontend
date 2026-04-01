export interface Token {
  id: string;
  name: string;
  ticker: string;
  balance: number;
  price: number;
}

export const MOCK_TOKENS: Token[] = [
  {
    id: "usdc",
    name: "USD Coin",
    ticker: "USDC",
    balance: 25_430.5,
    price: 1,
  },
  {
    id: "usdt",
    name: "Tether",
    ticker: "USDT",
    balance: 8500,
    price: 1,
  },
  {
    id: "eth",
    name: "Ethereum",
    ticker: "ETH",
    balance: 5.742,
    price: 2450,
  },
  {
    id: "dai",
    name: "Dai Stablecoin",
    ticker: "DAI",
    balance: 3200,
    price: 1,
  },
  {
    id: "wbtc",
    name: "Wrapped Bitcoin",
    ticker: "WBTC",
    balance: 0.25,
    price: 43_500,
  },
  {
    id: "paxg",
    name: "Paxos Gold",
    ticker: "PAXG",
    balance: 1.1,
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
