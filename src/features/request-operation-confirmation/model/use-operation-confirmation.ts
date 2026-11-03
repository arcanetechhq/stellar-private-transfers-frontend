import { useRef, useState } from "react";
import { useAppSelector } from "@/store";
import { selectWalletPublicKey } from "@/entities/wallet";
import type { ConfirmationPreview } from "../api/operation-confirmation-api";
import type { ConfirmationPeriodKind } from "./confirmation-period";
import {
  blockingOperationIdFrom,
  runDownload,
  type SignedDraft,
} from "./confirmation-session";
import {
  useAutomaticConfirmationPreview,
  type PreviewState,
} from "./use-automatic-confirmation-preview";

export function useOperationConfirmation(open: boolean) {
  const publicKey = useAppSelector(selectWalletPublicKey) ?? "";
  const [kind, setKind] = useState<ConfirmationPeriodKind>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [draft, setDraft] = useState<SignedDraft | undefined>();
  const [preview, setPreview] = useState<ConfirmationPreview | undefined>();
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [blockingOperationId, setBlockingOperationId] = useState<
    string | undefined
  >();
  const requestSerial = useRef(0);
  const state: PreviewState = {
    open,
    publicKey,
    kind,
    fromDate,
    toDate,
    draft,
    requestSerial,
    setKind,
    setFromDate,
    setToDate,
    setDraft,
    setPreview,
    setError,
    setBusy,
    setBlockingOperationId,
  };
  useAutomaticConfirmationPreview(state);
  return confirmationView(state);
}

function confirmationView(state: PreviewState) {
  function clearSignedPeriod() {
    state.setDraft(undefined);
    state.setPreview(undefined);
    state.setError(false);
    state.setBlockingOperationId(undefined);
  }

  function invalidateRequest() {
    state.requestSerial.current += 1;
  }

  return {
    publicKey: state.publicKey,
    kind: state.kind,
    fromDate: state.fromDate,
    toDate: state.toDate,
    preview: state.preview,
    error: state.error,
    busy: state.busy,
    blockingOperationId: state.blockingOperationId,
    changeKind: bindPeriodChange({
      current: state.kind,
      apply: state.setKind,
      invalidate: invalidateRequest,
      clear: clearSignedPeriod,
    }),
    changeFromDate: bindPeriodChange({
      current: state.fromDate,
      apply: state.setFromDate,
      invalidate: invalidateRequest,
      clear: clearSignedPeriod,
    }),
    changeToDate: bindPeriodChange({
      current: state.toDate,
      apply: state.setToDate,
      invalidate: invalidateRequest,
      clear: clearSignedPeriod,
    }),
    downloadStatement: () => downloadCurrentStatement(state),
  };
}

function bindPeriodChange<Value extends string>(input: {
  current: Value;
  apply: (value: Value) => void;
  invalidate: () => void;
  clear: () => void;
}): (next: Value) => void {
  return (next) => {
    if (next === input.current) {
      return;
    }
    input.invalidate();
    input.apply(next);
    input.clear();
  };
}

function downloadCurrentStatement(state: PreviewState): Promise<void> {
  const serial = state.requestSerial.current;
  return runDownload({
    publicKey: state.publicKey,
    kind: state.kind,
    fromDate: state.fromDate,
    toDate: state.toDate,
    draft: state.draft,
    isCurrent: () => state.requestSerial.current === serial,
    onError: (failure) => {
      state.setBlockingOperationId(blockingOperationIdFrom(failure));
    },
    setDraft: state.setDraft,
    setPreview: state.setPreview,
    setError: state.setError,
    setBusy: state.setBusy,
    setBlockingOperationId: state.setBlockingOperationId,
  });
}
