import type { ReactNode } from "react";
import "./stellar-wallet.css";
import { useTranslation } from "react-i18next";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import {
  Dialog,
  DialogDescription,
  DialogPortal,
  DialogTitle,
} from "@/shared/ui/dialog";

type StellarWalletModalShellProperties = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  ariaLabel: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function StellarWalletModalShell({
  open,
  onOpenChange,
  title,
  description,
  ariaLabel,
  children,
  footer,
}: StellarWalletModalShellProperties) {
  const { t: translate } = useTranslation("common");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogPrimitive.Overlay className="sheet-backdrop sheet-backdrop--modal" />
        <DialogPrimitive.Content
          className="action-sheet action-sheet--wallet stellar-wallet-modal gap-0 overflow-hidden border-border p-0 outline-none sm:max-w-[520px]"
          aria-label={ariaLabel}
        >
          <div className="stellar-wallet-modal__header">
            <span>
              <DialogTitle className="stellar-wallet-modal__title">
                {title}
              </DialogTitle>
              <DialogDescription className="stellar-wallet-modal__description">
                {description}
              </DialogDescription>
            </span>
            <button
              type="button"
              className="stellar-wallet-modal__close"
              aria-label={translate("a11y.close")}
              onClick={() => onOpenChange(false)}
            >
              <X size={22} strokeWidth={1.7} />
            </button>
          </div>

          <div className="stellar-wallet-modal__body">{children}</div>

          {footer ? (
            <div className="stellar-wallet-modal__footer">{footer}</div>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
