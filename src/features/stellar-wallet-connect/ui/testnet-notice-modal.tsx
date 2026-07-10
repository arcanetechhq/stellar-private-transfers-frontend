import { useTranslation } from "react-i18next";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import {
  Dialog,
  DialogDescription,
  DialogPortal,
  DialogTitle,
} from "@/shared/ui/dialog";
import "./testnet-notice-modal.css";

type TestnetNoticeModalProperties = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChooseWallet: () => void;
};

export function TestnetNoticeModal({
  open,
  onOpenChange,
  onChooseWallet,
}: TestnetNoticeModalProperties) {
  const { t: translate } = useTranslation("common");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogPrimitive.Overlay className="testnet-notice-modal__backdrop" />
        <DialogPrimitive.Content
          className="testnet-notice-modal"
          aria-label={translate("testnetNoticeTitle")}
        >
          <button
            type="button"
            className="testnet-notice-modal__close"
            aria-label={translate("a11y.close")}
            onClick={() => onOpenChange(false)}
          >
            <X size={20} strokeWidth={1.8} />
          </button>

          <div className="testnet-notice-modal__copy">
            <DialogTitle className="testnet-notice-modal__title">
              {translate("testnetNoticeTitle")}
            </DialogTitle>
            <DialogDescription className="testnet-notice-modal__description">
              {translate("testnetNoticeDescription")}
            </DialogDescription>
          </div>

          <button
            type="button"
            className="testnet-notice-modal__action"
            onClick={onChooseWallet}
          >
            <span>{translate("testnetNoticeChooseWallet")}</span>
          </button>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
