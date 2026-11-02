import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogPortal, DialogTitle } from "@/shared/ui/dialog";
import type { ConfirmationPeriodKind } from "../model/confirmation-period";
import { useOperationConfirmation } from "../model/use-operation-confirmation";
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

function ConfirmationForm(input: {
  confirmation: ConfirmationState;
  translate: (key: string) => string;
}) {
  const { confirmation, translate } = input;
  const canDownload =
    confirmation.preview?.readable === true &&
    confirmation.preview.rowCount === 0 &&
    !confirmation.busy;
  const periodLabels = {
    all: translate("confirmationDialog.periods.all"),
    week: translate("confirmationDialog.periods.week"),
    month: translate("confirmationDialog.periods.month"),
    year: translate("confirmationDialog.periods.year"),
    custom: translate("confirmationDialog.periods.custom"),
  } satisfies Record<ConfirmationPeriodKind, string>;
  return (
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
      {confirmation.preview ? (
        <p className="confirmation-note">
          {translate("confirmationDialog.empty")}
        </p>
      ) : undefined}
      {confirmation.error ? (
        <p className="confirmation-error">
          {translate("confirmationDialog.failed")}
        </p>
      ) : undefined}
      {confirmation.publicKey ? undefined : (
        <p className="confirmation-note">
          {translate("confirmationDialog.connectWallet")}
        </p>
      )}
      <div className="confirmation-actions">
        <button
          type="button"
          className="export-sheet__submit"
          disabled={confirmation.busy || !confirmation.publicKey}
          onClick={() => void confirmation.previewStatement()}
        >
          {translate("confirmationDialog.preview")}
        </button>
        <button
          type="button"
          className="export-sheet__submit"
          disabled={!canDownload || !confirmation.publicKey}
          onClick={() => void confirmation.downloadStatement()}
        >
          {translate("confirmationDialog.download")}
        </button>
      </div>
    </div>
  );
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
