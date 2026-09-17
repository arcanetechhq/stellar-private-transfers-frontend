import { useEffect, useState } from "react";
import { amountInputToStroops } from "@/shared/lib/stellar/stroops.js";
import { getRequiredApiBaseUrl } from "@/shared/stellar/stellar-network-environment.js";
import {
  formatRequiredFeeDisplay,
  protocolFeeDecimals,
} from "./format-required-fee-display.js";
import { protocolFeeQuoteRequest } from "./quote-request.js";
import { quoteProtocolFee } from "./quote-protocol-fee.js";
import type { ProtocolFeeKind } from "./quote-request.js";

export function useRequiredFeeDisplay(input: {
  kind: ProtocolFeeKind;
  amount: string;
  feeAsset: string | null | undefined;
  decimals: number | null | undefined;
  ticker: string;
}): string {
  const [display, setDisplay] = useState("");
  const feeAsset = input.feeAsset?.trim() ?? "";
  const decimals = protocolFeeDecimals(input.decimals);
  const ticker = input.ticker.trim();

  useEffect(() => {
    const instructed = amountInputToStroops(input.amount);
    if (!feeAsset || instructed === undefined || instructed <= 0n) {
      setDisplay("");
      return;
    }
    let cancelled = false;
    void quoteProtocolFee({
      apiBaseUrl: getRequiredApiBaseUrl(),
      request: protocolFeeQuoteRequest({
        kind: input.kind,
        feeAsset,
        instructedMinor: instructed.toString(),
      }),
    })
      .then((quote) => {
        if (cancelled) {
          return;
        }
        const formatted = formatRequiredFeeDisplay({
          requiredFeeMinor: quote.requiredFee,
          decimals,
          ticker,
        });
        setDisplay(formatted ?? "");
      })
      .catch(() => {
        if (!cancelled) {
          setDisplay("");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [input.kind, input.amount, feeAsset, decimals, ticker]);

  return display;
}
