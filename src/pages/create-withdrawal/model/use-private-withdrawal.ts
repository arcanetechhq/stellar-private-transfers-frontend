import { useCallback } from "react";
import { useAppDispatch } from "@/app/hooks";
import {
  submitPrivateWithdrawalThunk,
  type SubmitPrivateWithdrawalPayload,
} from "./private-withdrawal-thunks";

export function usePrivateWithdrawal() {
  const dispatch = useAppDispatch();
  const submit = useCallback(
    (payload: SubmitPrivateWithdrawalPayload) =>
      dispatch(submitPrivateWithdrawalThunk(payload)).unwrap(),
    [dispatch],
  );
  return { submit };
}
