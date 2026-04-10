import { createAsyncThunk } from "@reduxjs/toolkit";
import type { AppDispatch, RootState } from "@/store";
import type { RunPrivateWithdrawalMutationResult } from "../lib/run-private-withdrawal-mutation";
import type { SubmitPrivateWithdrawalPayload } from "./private-withdrawal-submit-payload";
import { submitPrivateWithdrawalThunkBody } from "./private-withdrawal-thunk-body";

export type { SubmitPrivateWithdrawalPayload } from "./private-withdrawal-submit-payload";

export const submitPrivateWithdrawalThunk = createAsyncThunk<
  RunPrivateWithdrawalMutationResult,
  SubmitPrivateWithdrawalPayload,
  { state: RootState; dispatch: AppDispatch; rejectValue: string }
>(
  "createWithdrawal/submitPrivate",
  async (payload, thunkApi) =>
    submitPrivateWithdrawalThunkBody(payload, {
      getState: thunkApi.getState,
      dispatch: thunkApi.dispatch,
      rejectWithValue: thunkApi.rejectWithValue,
    }),
);
