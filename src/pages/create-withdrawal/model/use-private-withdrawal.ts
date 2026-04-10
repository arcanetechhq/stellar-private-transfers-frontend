import { useCallback } from "react";
import { useAppDispatch } from "@/store";
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
