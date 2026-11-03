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
import {
  beginPublishedConfirmation,
  publishConfirmation,
} from "./confirmation-preview-store";
import { downloadConfirmationPdf } from "./download-confirmation-pdf";
import { signOperationConfirmation } from "./sign-operation-confirmation";

export type SignedDraft = {
  key: string;
  challenge: string;
  signature: string;
};

export type ConfirmationControls = {
  publicKey: string;
  kind: ConfirmationPeriodKind;
  fromDate: string;
  toDate: string;
  draft: SignedDraft | undefined;
  isCurrent: () => boolean;
  onError: (error: unknown) => void;
  setDraft: (draft: SignedDraft) => void;
  setPreview: (preview: ConfirmationPreview) => void;
  setError: (error: boolean) => void;
  setBusy: (busy: boolean) => void;
  setBlockingOperationId: (operationId: string | undefined) => void;
};

async function loadSession(
  controls: ConfirmationControls,
): Promise<SignedDraft> {
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

async function runSession(
  controls: ConfirmationControls,
  useSession: (session: SignedDraft) => Promise<void>,
): Promise<void> {
  controls.setBusy(true);
  controls.setError(false);
  controls.setBlockingOperationId(undefined);
  try {
    const session = await loadSession(controls);
    if (!controls.isCurrent()) {
      return;
    }
    controls.setDraft(session);
    await useSession(session);
  } catch (error: unknown) {
    if (!controls.isCurrent()) {
      return;
    }
    controls.setError(true);
    controls.onError(error);
  } finally {
    if (controls.isCurrent()) {
      controls.setBusy(false);
    }
  }
}

export function runPreview(controls: ConfirmationControls): Promise<void> {
  const token = beginPublishedConfirmation();
  let publishedResult = false;
  return runSession(controls, async (session) => {
    const preview = await previewOperationConfirmation({
      apiBaseUrl: getRequiredApiBaseUrl(),
      challenge: session.challenge,
      signature: session.signature,
    });
    publishedResult = true;
    publishConfirmation(token, { busy: false, error: false, preview });
    if (controls.isCurrent()) {
      controls.setPreview(preview);
    }
  }).finally(() => {
    if (!publishedResult) {
      publishConfirmation(token, { busy: false, error: true });
    }
  });
}

export function runDownload(controls: ConfirmationControls): Promise<void> {
  return runSession(controls, async (session) => {
    downloadConfirmationPdf(
      await issueOperationConfirmation({
        apiBaseUrl: getRequiredApiBaseUrl(),
        challenge: session.challenge,
        signature: session.signature,
      }),
    );
  });
}

export function blockingOperationIdFrom(error: unknown): string | undefined {
  if (!(error instanceof OperationConfirmationRequestError)) {
    return;
  }
  return error.blockingOperationId;
}
