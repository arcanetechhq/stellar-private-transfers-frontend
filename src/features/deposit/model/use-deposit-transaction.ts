import { useCallback, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { selectWalletPublicKey } from "@/entities/wallet";
import { mapPrivacySdkError } from "@/shared/lib/privacy-sdk/map-privacy-sdk-errors.js";
import { ProtocolRelayClientError } from "@/shared/lib/protocol-relay";
import { runDepositMutation } from "../lib/run-deposit-mutation.js";
import type {
  DepositTransactionInput,
  DepositTransactionResult,
} from "./deposit-transaction-types.js";

export type {
  DepositTransactionInput,
  DepositTransactionResult,
} from "./deposit-transaction-types.js";

function toDepositError(error: unknown): Error {
  if (error instanceof ProtocolRelayClientError) {
    return error;
  }
  return new Error(mapPrivacySdkError(error));
}

export function useDepositTransaction() {
  const dispatch = useAppDispatch();
  const walletPublicKey = useAppSelector(selectWalletPublicKey);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | undefined>();

  const mutateAsync = useCallback(
    async (
      input: DepositTransactionInput,
    ): Promise<DepositTransactionResult> => {
      setIsPending(true);
      setError(undefined);
      try {
        if (!walletPublicKey) {
          throw new Error("Wallet not connected");
        }
        return await runDepositMutation({
          dispatch,
          ...input,
          walletPublicKey,
        });
      } catch (error_) {
        const nextError = toDepositError(error_);
        setError(nextError);
        throw nextError;
      } finally {
        setIsPending(false);
      }
    },
    [dispatch, walletPublicKey],
  );

  return { mutateAsync, isPending, error };
}
