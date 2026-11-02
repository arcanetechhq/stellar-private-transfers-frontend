import { useEffect, useState } from "react";
import { useAppSelector } from "@/store";
import { selectWalletPublicKey } from "@/entities/wallet";
import { readClientEnvironment } from "@/shared/lib/privacy-sdk/read-client-environment";
import { getRequiredApiBaseUrl } from "@/shared/stellar/stellar-network-environment";
import {
  issueOperationConfirmation,
  openOperationConfirmationChallenge,
  OperationConfirmationRequestError,
  previewOperationConfirmation,
  type ConfirmationPreview,
} from "../api/operation-confirmation-api";
import {
  confirmationPeriodBody,
  confirmationPeriodKey,
  type ConfirmationPeriodKind,
} from "./confirmation-period";
import { downloadConfirmationPdf } from "./download-confirmation-pdf";
import { signOperationConfirmation } from "./sign-operation-confirmation";

type SignedDraft = {
  key: string;
  challenge: string;
  signature: string;
};

type ConfirmationControls = {
  publicKey: string;
  kind: ConfirmationPeriodKind;
  fromDate: string;
  toDate: string;
  draft: SignedDraft | undefined;
  setDraft: (draft: SignedDraft) => void;
  setPreview: (preview: ConfirmationPreview) => void;
  setError: (error: boolean) => void;
  setBusy: (busy: boolean) => void;
  setBlockingOperationId: (operationId: string | undefined) => void;
};

async function loadSession(controls: ConfirmationControls): Promise<SignedDraft> {
  const key = confirmationPeriodKey({
    kind: controls.kind,
    fromDate: controls.fromDate,
    toDate: controls.toDate,
  });
  if (controls.draft?.key === key) {
    return controls.draft;
  }
  const period = confirmationPeriodBody({
    kind: controls.kind,
    fromDate: controls.fromDate,
    toDate: controls.toDate,
  });
  const applicationId = readClientEnvironment("VITE_APPLICATION_ID");
  if (!period || !controls.publicKey || !applicationId) {
    throw new Error("Operation Confirmation request is incomplete");
  }
  const opened = await openOperationConfirmationChallenge({
    apiBaseUrl: getRequiredApiBaseUrl(),
    applicationId,
    subject: controls.publicKey,
    period,
  });
  const signature = await signOperationConfirmation({
    challenge: opened.challenge,
    address: controls.publicKey,
  });
  return { key, challenge: opened.challenge, signature };
}

async function runPreview(controls: ConfirmationControls): Promise<void> {
  controls.setBusy(true);
  controls.setError(false);
  controls.setBlockingOperationId(undefined);
  try {
    const session = await loadSession(controls);
    controls.setDraft(session);
    controls.setPreview(
      await previewOperationConfirmation({
        apiBaseUrl: getRequiredApiBaseUrl(),
        challenge: session.challenge,
        signature: session.signature,
      }),
    );
  } catch {
    controls.setError(true);
  } finally {
    controls.setBusy(false);
  }
}

async function runDownload(controls: ConfirmationControls): Promise<void> {
  controls.setBusy(true);
  controls.setError(false);
  controls.setBlockingOperationId(undefined);
  try {
    const session = await loadSession(controls);
    controls.setDraft(session);
    downloadConfirmationPdf(
      await issueOperationConfirmation({
        apiBaseUrl: getRequiredApiBaseUrl(),
        challenge: session.challenge,
        signature: session.signature,
      }),
    );
  } catch (error: unknown) {
    controls.setError(true);
    controls.setBlockingOperationId(blockingOperationIdFrom(error));
  } finally {
    controls.setBusy(false);
  }
}

function blockingOperationIdFrom(error: unknown): string | undefined {
  if (!(error instanceof OperationConfirmationRequestError)) {
    return;
  }
  return error.blockingOperationId;
}

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

  useEffect(() => {
    if (open) {
      return;
    }
    setKind("all");
    setFromDate("");
    setToDate("");
    setDraft(undefined);
    setPreview(undefined);
    setError(false);
    setBlockingOperationId(undefined);
  }, [open]);

  function clearSignedPeriod() {
    setDraft(undefined);
    setPreview(undefined);
    setError(false);
    setBlockingOperationId(undefined);
  }

  const controls: ConfirmationControls = {
    publicKey,
    kind,
    fromDate,
    toDate,
    draft,
    setDraft,
    setPreview,
    setError,
    setBusy,
    setBlockingOperationId,
  };

  return {
    publicKey,
    kind,
    fromDate,
    toDate,
    preview,
    error,
    busy,
    blockingOperationId,
    changeKind: (next: ConfirmationPeriodKind) => {
      setKind(next);
      clearSignedPeriod();
    },
    changeFromDate: (next: string) => {
      setFromDate(next);
      clearSignedPeriod();
    },
    changeToDate: (next: string) => {
      setToDate(next);
      clearSignedPeriod();
    },
    previewStatement: () => runPreview(controls),
    downloadStatement: () => runDownload(controls),
  };
}
