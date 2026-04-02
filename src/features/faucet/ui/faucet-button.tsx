import React from "react";
import { Droplets, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { FaucetStatus } from "../lib/use-faucet";

const BASE_CLASSES =
  "inline-flex w-24 items-center justify-center gap-1.5 rounded-[10px] px-3 py-2 text-[13px] font-semibold leading-[18px] transition-colors";

const FAUCET_CLASSES =
  "border border-[var(--border)] bg-[var(--secondary)] text-[var(--foreground)] hover:border-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] disabled:pointer-events-none disabled:opacity-50";

interface FaucetButtonProperties {
  address: string;
  status: FaucetStatus;
  onMint: (address: string) => Promise<void>;
}

export function FaucetButton({
  address,
  status,
  onMint,
}: FaucetButtonProperties) {
  const { t: translate } = useTranslation("assets");
  const isLoading = status === "loading";

  return (
    <button
      disabled={isLoading || !address}
      className={`${BASE_CLASSES} ${FAUCET_CLASSES}`}
      onClick={() => void onMint(address)}
      title={translate("faucet.hint")}
    >
      {isLoading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <>
          <Droplets className="h-3.5 w-3.5" />
          {translate("faucet.mint")}
        </>
      )}
    </button>
  );
}
