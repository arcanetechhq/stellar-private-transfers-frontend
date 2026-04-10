import React, { useState } from "react";

interface TokenIconProperties {
  ticker?: string;
  logoUrl?: string | null;
  size?: "sm" | "md" | "lg" | number;
  className?: string;
}

const SIZE_CLASS_MAP: Record<"sm" | "md" | "lg", string> = {
  sm: "size-5",
  md: "size-6",
  lg: "size-8",
};

function sizeToClass(size: "sm" | "md" | "lg" | number): {
  className?: string;
  style?: React.CSSProperties;
} {
  if (typeof size === "number") {
    return { style: { width: `${size}px`, height: `${size}px` } };
  }
  return { className: SIZE_CLASS_MAP[size] };
}

function FallbackIcon({ symbol }: { symbol: string }) {
  return (
    <div className="relative size-full">
      <svg
        className="absolute block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 120 120"
      >
        <circle cx="60" cy="60" r="60" fill="#6B7280" />
        <text
          x="60"
          y="60"
          textAnchor="middle"
          dominantBaseline="central"
          fill="white"
          fontSize="48"
          fontWeight="600"
        >
          {symbol.slice(0, 1).toUpperCase()}
        </text>
      </svg>
    </div>
  );
}

function RemoteIcon({ logoUrl, ticker }: { logoUrl: string; ticker: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <FallbackIcon symbol={ticker} />;
  }

  return (
    <img
      src={logoUrl}
      alt={ticker}
      className="size-full object-fill"
      onError={() => {
        setFailed(true);
      }}
    />
  );
}

export function TokenIcon({
  ticker = "",
  logoUrl,
  size = "md",
  className = "",
}: TokenIconProperties) {
  const { className: sizeClass, style: sizeStyle } = sizeToClass(size);

  return (
    <div
      className={`relative flex-shrink-0 ${sizeClass ?? ""} ${className}`}
      style={sizeStyle}
    >
      {logoUrl ? (
        <RemoteIcon logoUrl={logoUrl} ticker={ticker} />
      ) : (
        <FallbackIcon symbol={ticker} />
      )}
    </div>
  );
}
