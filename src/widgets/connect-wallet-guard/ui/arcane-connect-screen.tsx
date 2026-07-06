import { ArrowRight, Loader2, Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";
import Arcn from "@/shared/assets/logo-arcn";
import { ArcaneShaderGradient } from "./arcane-shader-gradient";
import "./arcane-connect-screen.css";

export type ArcaneConnectScreenPhase =
  | "prompt"
  | "connecting_wallet"
  | "checking"
  | "funding"
  | "registering"
  | "error";

type ArcaneConnectScreenProperties = {
  phase: ArcaneConnectScreenPhase;
  connectDisabled: boolean;
  isConnectingWallet: boolean;
  errorMessage?: string;
  onConnectWallet: () => void;
  onRetry: () => void;
};

function resolveStatusTitleKey(phase: ArcaneConnectScreenPhase): string {
  switch (phase) {
    case "connecting_wallet": {
      return "connectScreenConnectingTitle";
    }
    case "funding": {
      return "connectScreenFundingTitle";
    }
    case "registering": {
      return "connectScreenRegisteringTitle";
    }
    case "checking": {
      return "connectScreenCheckingTitle";
    }
    default: {
      return "connectScreenConnectingTitle";
    }
  }
}

export function ArcaneConnectScreen({
  phase,
  connectDisabled,
  isConnectingWallet,
  errorMessage,
  onConnectWallet,
  onRetry,
}: ArcaneConnectScreenProperties) {
  const { t: translate } = useTranslation("common");
  const isBusyPhase =
    phase === "connecting_wallet" ||
    phase === "checking" ||
    phase === "funding" ||
    phase === "registering";
  const isErrorPhase = phase === "error";

  return (
    <main className="arcane-connect-screen">
      <section
        className="arcane-connect-shell"
        aria-label={translate("connectScreenAriaLabel")}
        aria-busy={isBusyPhase}
      >
        <div className="arcane-connect-copy">
          <span className="arcane-connect-logo" aria-label="Arcane">
            <Arcn className="arcane-connect-logo-mark relative block" />
          </span>

          <div className="arcane-connect-heading">
            <h1>
              <span className="arcane-connect-heading-title-line">
                {translate("connectScreenTitleLine1")}
              </span>
              <span className="arcane-connect-heading-title-line">
                {translate("connectScreenTitleLine2")}
              </span>
            </h1>

            <p>
              {translate("connectScreenDescription")}
            </p>
          </div>

          {isBusyPhase ? (
            <div
              className="arcane-connect-status"
              role="status"
              aria-live="polite"
            >
              <Loader2
                size={21}
                strokeWidth={1.8}
                className="animate-spin"
                aria-hidden="true"
              />
              <span>{translate(resolveStatusTitleKey(phase))}</span>
            </div>
          ) : null}

          {isErrorPhase ? (
            <div className="arcane-connect-error" role="alert">
              <p className="arcane-connect-error__message">
                {errorMessage ?? translate("connectScreenSetupFailed")}
              </p>
              <button
                type="button"
                className="arcane-connect-primary"
                onClick={onRetry}
              >
                <span>{translate("connectScreenRetry")}</span>
                <ArrowRight size={20} strokeWidth={1.8} />
              </button>
            </div>
          ) : null}

          {phase === "prompt" ? (
            <button
              type="button"
              className="arcane-connect-primary"
              disabled={connectDisabled || isConnectingWallet}
              onClick={onConnectWallet}
            >
              {isConnectingWallet ? (
                <Loader2 size={21} strokeWidth={1.8} className="animate-spin" />
              ) : (
                <Wallet size={21} strokeWidth={1.8} />
              )}
              <span>{translate("connectWallet")}</span>
              <ArrowRight size={20} strokeWidth={1.8} />
            </button>
          ) : null}
        </div>

        <aside className="arcane-connect-visual" aria-hidden="true">
          <ArcaneShaderGradient />
        </aside>
      </section>
    </main>
  );
}
