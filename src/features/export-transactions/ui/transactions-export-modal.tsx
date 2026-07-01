import { useEffect, useState } from "react";
import "./transactions-export.css";
import { useTranslation } from "react-i18next";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { FileText, X } from "lucide-react";
import { Dialog, DialogPortal, DialogTitle } from "@/shared/ui/dialog";
import {
  resolveInitialExportType,
  type ExportFileFormat,
  type ExportPeriod,
  type ExportTransactionType,
  type TransactionsExportContext,
} from "../model/transactions-export-context";
import { ExportSelectField } from "./export-select-field";

type TransactionsExportModalProperties = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exportContext?: TransactionsExportContext;
};

export function TransactionsExportModal({
  open,
  onOpenChange,
  exportContext,
}: TransactionsExportModalProperties) {
  const { t: translate } = useTranslation("transactions");
  const initialType = resolveInitialExportType(exportContext?.filters?.type);
  const [transactionType, setTransactionType] =
    useState<ExportTransactionType>(initialType);
  const [fileFormat, setFileFormat] = useState<ExportFileFormat>("csv");
  const [period, setPeriod] = useState<ExportPeriod>("all");
  const [exported, setExported] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    setTransactionType(initialType);
    setFileFormat("csv");
    setPeriod("all");
    setExported(false);
  }, [initialType, open]);

  const transactionTypeOptions = [
    { label: translate("exportModal.types.all"), value: "all" as const },
    { label: translate("exportModal.types.inflow"), value: "inflow" as const },
    { label: translate("exportModal.types.outflow"), value: "outflow" as const },
  ];

  const fileFormatOptions = [
    { label: translate("exportModal.formats.csv"), value: "csv" as const },
    { label: translate("exportModal.formats.xlsx"), value: "xlsx" as const },
  ];

  const periodOptions = [
    { label: translate("exportModal.periods.all"), value: "all" as const },
    { label: translate("exportModal.periods.week"), value: "week" as const },
    { label: translate("exportModal.periods.month"), value: "month" as const },
    { label: translate("exportModal.periods.year"), value: "year" as const },
    { label: translate("exportModal.periods.custom"), value: "custom" as const },
  ];

  function handleClose() {
    onOpenChange(false);
  }

  function handleExport() {
    setExported(true);
    window.setTimeout(handleClose, 700);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogPrimitive.Overlay className="sheet-backdrop sheet-backdrop--modal" />
        <DialogPrimitive.Content
          className="action-sheet action-sheet--export"
          aria-label={translate("exportModal.title")}
          aria-describedby={undefined}
        >
          <div className="export-modal__header">
            <DialogTitle className="export-modal__title">
              {translate("exportModal.title")}
            </DialogTitle>
            <button
              type="button"
              className="export-modal__close"
              aria-label={translate("exportModal.close")}
              onClick={handleClose}
            >
              <X size={24} strokeWidth={1.7} />
            </button>
          </div>
          <div className="export-sheet">
            <div className="export-sheet__select-row">
              <ExportSelectField
                label={translate("exportModal.transactionType")}
                options={transactionTypeOptions}
                value={transactionType}
                onChange={setTransactionType}
              />
              <ExportSelectField
                label={translate("exportModal.fileFormat")}
                options={fileFormatOptions}
                value={fileFormat}
                onChange={setFileFormat}
                icon={FileText}
              />
            </div>
            <div className="export-period">
              <span className="export-period__label">
                {translate("exportModal.period")}
              </span>
              <div
                className="export-period__options"
                role="tablist"
                aria-label={translate("exportModal.period")}
              >
                {periodOptions.map((option) => (
                  <button
                    type="button"
                    className="export-period__button"
                    data-active={period === option.value}
                    key={option.value}
                    onClick={() => setPeriod(option.value)}
                    role="tab"
                    aria-selected={period === option.value}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="button"
              className="export-sheet__submit"
              onClick={handleExport}
            >
              {exported ? translate("exported") : translate("exportModal.export")}
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
