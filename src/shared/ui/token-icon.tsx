import React from "react";
import UsdCoinUsdc from "@/shared/assets/usd-coin-usdc";
import TetherUsdt from "@/shared/assets/tether-usdt";
import EthereumEth from "@/shared/assets/ethereum-eth";
import DaiDai from "@/shared/assets/dai-dai";
import PaxGoldPaxg from "@/shared/assets/pax-gold-paxg";
import Tokens from "@/shared/assets/tokens";

interface TokenIconProperties {
  symbol?: string;
  ticker?: string;
  size?: "sm" | "md" | "lg" | number;
  className?: string;
}

type IconComponentProperties = {
  className?: string;
};

const tokenComponents: Record<
  string,
  React.ComponentType<IconComponentProperties>
> = {
  USDC: UsdCoinUsdc,
  USDT: TetherUsdt,
  ETH: EthereumEth,
  WETH: EthereumEth,
  DAI: DaiDai,
  PAXG: PaxGoldPaxg,
  BTC: Tokens,
  WBTC: Tokens,

  LINK: () => <DefaultTokenIcon symbol="LINK" color="#2A5ADA" />,
  UNI: () => <DefaultTokenIcon symbol="UNI" color="#FF007A" />,
  MATIC: () => <DefaultTokenIcon symbol="MATIC" color="#8247E5" />,
};

function DefaultTokenIcon({
  symbol,
  color,
}: {
  symbol: string;
  color: string;
}) {
  return (
    <div className="relative size-full">
      <svg
        className="absolute block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 120 120"
      >
        <circle cx="60" cy="60" r="60" fill={color} />
        <text
          x="60"
          y="60"
          textAnchor="middle"
          dominantBaseline="central"
          fill="white"
          fontSize="48"
          fontWeight="600"
        >
          {symbol.slice(0, 1)}
        </text>
      </svg>
    </div>
  );
}

export function TokenIcon({
  symbol,
  ticker,
  size = "md",
  className = "",
}: TokenIconProperties) {
  const tokenSymbol = symbol || ticker || "";
  const TokenComponent = tokenComponents[tokenSymbol] || (() => (
    <DefaultTokenIcon symbol={tokenSymbol} color="#6B7280" />
  ));

  const getSizeStyles = () => {
    if (typeof size === "number") {
      return {
        width: `${size}px`,
        height: `${size}px`,
      };
    }

    const sizeMap = {
      sm: { width: "20px", height: "20px" },
      md: { width: "24px", height: "24px" },
      lg: { width: "32px", height: "32px" },
    };
    return sizeMap[size];
  };

  const sizeStyles = getSizeStyles();

  return (
    <div className={`relative flex-shrink-0 ${className}`} style={sizeStyles}>
      <TokenComponent className="relative size-full" />
    </div>
  );
}
