import { useEffect, useRef, type MutableRefObject } from "react";
import type { ConfirmationPreview } from "../api/operation-confirmation-api";
import {
  confirmationPeriodBody,
  confirmationPeriodKey,
  type ConfirmationPeriodKind,
} from "./confirmation-period";
import {
  runPreview,
  type ConfirmationControls,
  type SignedDraft,
} from "./confirmation-session";

export type PreviewState = {
  open: boolean;
  publicKey: string;
  kind: ConfirmationPeriodKind;
  fromDate: string;
  toDate: string;
  draft: SignedDraft | undefined;
  requestSerial: MutableRefObject<number>;
  setKind: (kind: ConfirmationPeriodKind) => void;
  setFromDate: (value: string) => void;
  setToDate: (value: string) => void;
  setDraft: (draft: SignedDraft | undefined) => void;
  setPreview: (preview: ConfirmationPreview | undefined) => void;
  setError: ConfirmationControls["setError"];
  setBusy: ConfirmationControls["setBusy"];
  setBlockingOperationId: ConfirmationControls["setBlockingOperationId"];
};

export function useAutomaticConfirmationPreview(state: PreviewState): void {
  const stateRef = useRef(state);
  stateRef.current = state;
  const { open, publicKey, kind, fromDate, toDate } = state;

  useEffect(() => {
    const current = stateRef.current;
    if (!open) {
      resetClosedConfirmation(current);
      return;
    }
    beginPreview(current, { kind, fromDate, toDate });
  }, [open, publicKey, kind, fromDate, toDate]);
}

function resetClosedConfirmation(state: PreviewState): void {
  state.requestSerial.current += 1;
  state.setKind("all");
  state.setFromDate("");
  state.setToDate("");
  state.setDraft(undefined);
  state.setPreview(undefined);
  state.setError(false);
  state.setBusy(false);
  state.setBlockingOperationId(undefined);
}

function beginPreview(
  state: PreviewState,
  period: { kind: ConfirmationPeriodKind; fromDate: string; toDate: string },
): void {
  if (state.publicKey === "" || !confirmationPeriodBody(period)) {
    return;
  }
  const serial = state.requestSerial.current + 1;
  state.requestSerial.current = serial;
  const periodKey = confirmationPeriodKey(period);
  const draft = state.draft?.key === periodKey ? state.draft : undefined;
  void runPreview({
    publicKey: state.publicKey,
    kind: period.kind,
    fromDate: period.fromDate,
    toDate: period.toDate,
    draft,
    isCurrent: () => state.requestSerial.current === serial,
    onError: () => undefined,
    setDraft: state.setDraft,
    setPreview: state.setPreview,
    setError: state.setError,
    setBusy: state.setBusy,
    setBlockingOperationId: state.setBlockingOperationId,
  });
}
