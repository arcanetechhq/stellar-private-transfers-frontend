import { useCallback } from "react";
import { useAppDispatch } from "@/store";
import {
  submitConfidentialTransferThunk,
  type SubmitConfidentialTransferPayload,
} from "./confidential-transfer-thunks";

export function useConfidentialTransfer() {
  const dispatch = useAppDispatch();
  const submit = useCallback(
    (payload: SubmitConfidentialTransferPayload) =>
      dispatch(submitConfidentialTransferThunk(payload)).unwrap(),
    [dispatch],
  );
  return { submit };
}
