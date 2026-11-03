import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogPortal, DialogTitle } from "@/shared/ui/dialog";
import {
  canDownloadOperationConfirmation,
  previewNotice,
} from "../api/operation-confirmation-api";
import type { ConfirmationPeriodKind } from "../model/confirmation-period";
import { usePublishedConfirmation } from "../model/confirmation-preview-store";
import { useOperationConfirmation } from "../model/use-operation-confirmation";
import { ConfirmationTable } from "./confirmation-table";
import "./operation-confirmation-dialog.css";
import { PeriodPicker } from "./period-picker";

const CLOSE_ICON_SIZE = 24;
const CLOSE_ICON_STROKE = 1.7;

type OperationConfirmationDialogProperties = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type ConfirmationState = ReturnType<typeof useOperationConfirmation>;

export function OperationConfirmationDialog({
  open,
  onOpenChange,
}: OperationConfirmationDialogProperties) {
  const { t: translate } = useTranslation("transactions");
  const confirmation = useOperationConfirmation(open);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogPrimitive.Overlay className="sheet-backdrop sheet-backdrop--modal" />
        <DialogPrimitive.Content
          className="action-sheet action-sheet--export"
          aria-label={translate("confirmationDialog.title")}
        >
          <ConfirmationHeader
            title={translate("confirmationDialog.title")}
            closeLabel={translate("confirmationDialog.close")}
            onClose={() => onOpenChange(false)}
          />
          <ConfirmationForm confirmation={confirmation} translate={translate} />
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}

type Translate = (key: string, options?: Record<string, string>) => string;

function ConfirmationForm(input: {
  confirmation: ConfirmationState;
  translate: Translate;
}) {
  const { confirmation, translate } = input;
  const published = usePublishedConfirmation();
  const preview = published.preview ?? confirmation.preview;
  const busy = published.preview ? false : published.busy || confirmation.busy;
  const canDownload = canDownloadOperationConfirmation(preview, busy);
  const periodLabels = {
    all: translate("confirmationDialog.periods.all"),
    week: translate("confirmationDialog.periods.week"),
    month: translate("confirmationDialog.periods.month"),
    year: translate("confirmationDialog.periods.year"),
    custom: translate("confirmationDialog.periods.custom"),
  } satisfies Record<ConfirmationPeriodKind, string>;
  return (
    <>
      <div className="export-sheet">
        <PeriodPicker
          label={translate("confirmationDialog.period")}
          kind={confirmation.kind}
          labels={periodLabels}
          onChange={confirmation.changeKind}
        />
        {confirmation.kind === "custom" ? (
          <CustomRange
            fromLabel={translate("confirmationDialog.from")}
            toLabel={translate("confirmationDialog.to")}
            fromDate={confirmation.fromDate}
            toDate={confirmation.toDate}
            onFromDate={confirmation.changeFromDate}
            onToDate={confirmation.changeToDate}
          />
        ) : undefined}
        <p className="confirmation-note">
          {translate("confirmationDialog.warning")}
        </p>
        <ConfirmationNotice
          preview={preview}
          busy={busy}
          blockingOperationId={confirmation.blockingOperationId}
          translate={translate}
        />
        {confirmation.error || published.error ? (
          <p className="confirmation-error">
            {translate("confirmationDialog.failed")}
          </p>
        ) : undefined}
        {confirmation.publicKey ? undefined : (
          <p className="confirmation-note">
            {translate("confirmationDialog.connectWallet")}
          </p>
        )}
      </div>
      <div className="confirmation-actions">
        <button
          type="button"
          className="export-sheet__submit"
          disabled={!canDownload || !confirmation.publicKey}
          onClick={() => void confirmation.downloadStatement()}
        >
          {translate("confirmationDialog.download")}
        </button>
      </div>
    </>
  );
}

function ConfirmationNotice(input: {
  preview: ConfirmationState["preview"];
  busy: boolean;
  blockingOperationId: string | undefined;
  translate: Translate;
}) {
  const notice = previewNotice(input.preview, input.blockingOperationId);
  if (notice.kind === "blocking") {
    return (
      <p className="confirmation-error">
        {input.translate("confirmationDialog.blocking", {
          id: notice.operationId,
        })}
      </p>
    );
  }
  if (notice.kind === "rows") {
    return (
      <ConfirmationTable
        rows={notice.rows}
        labels={{
          date: input.translate("confirmationDialog.columns.date"),
          type: input.translate("confirmationDialog.columns.type"),
          amount: input.translate("confirmationDialog.columns.amount"),
          from: input.translate("confirmationDialog.columns.from"),
          to: input.translate("confirmationDialog.columns.to"),
        }}
      />
    );
  }
  if (notice.kind === "none" && input.busy) {
    return (
      <p className="confirmation-note">
        {input.translate("confirmationDialog.loading")}
      </p>
    );
  }
  if (notice.kind === "empty") {
    return (
      <p className="confirmation-note">
        {input.translate("confirmationDialog.empty")}
      </p>
    );
  }
  return <></>;
}

function ConfirmationHeader(input: {
  title: string;
  closeLabel: string;
  onClose: () => void;
}) {
  return (
    <div className="export-modal__header">
      <DialogTitle className="export-modal__title">{input.title}</DialogTitle>
      <button
        type="button"
        className="export-modal__close"
        aria-label={input.closeLabel}
        onClick={input.onClose}
      >
        <X size={CLOSE_ICON_SIZE} strokeWidth={CLOSE_ICON_STROKE} />
      </button>
    </div>
  );
}

function CustomRange(input: {
  fromLabel: string;
  toLabel: string;
  fromDate: string;
  toDate: string;
  onFromDate: (value: string) => void;
  onToDate: (value: string) => void;
}) {
  return (
    <div className="confirmation-range">
      <label>
        {input.fromLabel}
        <input
          type="date"
          value={input.fromDate}
          onChange={(event) => input.onFromDate(event.target.value)}
        />
      </label>
      <label>
        {input.toLabel}
        <input
          type="date"
          value={input.toDate}
          onChange={(event) => input.onToDate(event.target.value)}
        />
      </label>
    </div>
  );
}
