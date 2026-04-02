import { useCallback, useState } from "react";
import { useMintAssetMutation } from "../api/faucet-api";

const FRIENDBOT_URL = "https://friendbot.stellar.org";

export type FaucetStatus = "idle" | "loading" | "success" | "error";

interface UseFaucetResult {
  mint: (address: string) => Promise<void>;
  status: FaucetStatus;
  reset: () => void;
}

export function useFaucetForNative(): UseFaucetResult {
  const [status, setStatus] = useState<FaucetStatus>("idle");

  const mint = useCallback(async (address: string) => {
    setStatus("loading");
    try {
      const url = `${FRIENDBOT_URL}?addr=${encodeURIComponent(address)}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Friendbot error: ${response.status}`);
      }
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
  }, []);

  return { mint, status, reset };
}

export function useFaucetForAsset(assetId: string): UseFaucetResult {
  const [mintAsset, { isLoading, isSuccess, isError, reset: resetMutation }] =
    useMintAssetMutation();

  const status: FaucetStatus = isLoading
    ? "loading"
    : isSuccess
      ? "success"
      : isError
        ? "error"
        : "idle";

  const mint = useCallback(
    async (address: string) => {
      await mintAsset({ assetId, address });
    },
    [mintAsset, assetId],
  );

  return { mint, status, reset: resetMutation };
}
