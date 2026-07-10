import { useCallback, useState } from "react";
import { useMintAssetMutation } from "@/entities/asset";
import {
  assertFaucetClaimAllowed,
  hasClaimedFaucetToday,
  markFaucetClaimedToday,
} from "./faucet-daily-limit";
import { fundNativeViaFriendbot } from "./fund-native-via-friendbot";

export type FaucetStatus =
  | "idle"
  | "loading"
  | "success"
  | "error"
  | "limited";

function assetFaucetStatusFromMutation(parameters: {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  isLimited: boolean;
}): FaucetStatus {
  if (parameters.isLimited) {
    return "limited";
  }
  if (parameters.isLoading) {
    return "loading";
  }
  if (parameters.isSuccess) {
    return "success";
  }
  if (parameters.isError) {
    return "error";
  }
  return "idle";
}

interface UseFaucetResult {
  mint: (address: string) => Promise<void>;
  status: FaucetStatus;
  reset: () => void;
}

export function useFaucetForNative(): UseFaucetResult {
  const [status, setStatus] = useState<FaucetStatus>("idle");

  const mint = useCallback(async (address: string) => {
    try {
      assertFaucetClaimAllowed(address, "xlm");
    } catch {
      setStatus("limited");
      return;
    }
    setStatus("loading");
    try {
      const result = await fundNativeViaFriendbot(address);
      markFaucetClaimedToday(address, "xlm");
      setStatus(result === "already_funded" ? "limited" : "success");
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
  const [isLimited, setIsLimited] = useState(false);

  const status: FaucetStatus = assetFaucetStatusFromMutation({
    isLoading,
    isSuccess,
    isError,
    isLimited,
  });

  const mint = useCallback(
    async (address: string) => {
      if (hasClaimedFaucetToday(address, assetId)) {
        setIsLimited(true);
        return;
      }
      setIsLimited(false);
      await mintAsset({ assetId, address }).unwrap();
      markFaucetClaimedToday(address, assetId);
    },
    [mintAsset, assetId],
  );

  const reset = useCallback(() => {
    setIsLimited(false);
    resetMutation();
  }, [resetMutation]);

  return { mint, status, reset };
}
