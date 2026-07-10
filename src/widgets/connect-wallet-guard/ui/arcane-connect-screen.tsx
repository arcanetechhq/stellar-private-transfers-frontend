import { Loader2, RefreshCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import Arcn from "@/shared/assets/logo-arcn";
import { FREIGHTER_ICON_URL } from "@/features/stellar-wallet-connect";
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
  isFreighterAvailable: boolean;
  errorMessage?: string;
  onConnectWallet: () => void;
  onRetry: () => void;
  onChangeWallet: () => void;
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

function FreighterButtonIcon() {
  return (
    <img
      className="arcane-connect-primary__wallet-icon"
      src={FREIGHTER_ICON_URL}
      alt=""
      width={21}
      height={21}
      aria-hidden="true"
    />
  );
}

function ArcaneConnectPrimaryAction(properties: {
  phase: ArcaneConnectScreenPhase;
  connectDisabled: boolean;
  isConnectingWallet: boolean;
  isBusyPhase: boolean;
  isFreighterAvailable: boolean;
  onConnectWallet: () => void;
}) {
  const { t: translate } = useTranslation("common");
  const {
    phase,
    connectDisabled,
    isConnectingWallet,
    isBusyPhase,
    isFreighterAvailable,
    onConnectWallet,
  } = properties;
  const promptLabel = isFreighterAvailable
    ? translate("connectFreighter")
    : translate("installFreighter");

  return (
    <button
      type="button"
      className="arcane-connect-primary"
      disabled={connectDisabled || isBusyPhase || isConnectingWallet}
      onClick={onConnectWallet}
      {...(isBusyPhase
        ? { "aria-live": "polite" as const, role: "status" as const }
        : {})}
    >
      {phase === "prompt" ? <FreighterButtonIcon /> : null}
      <span>
        {isBusyPhase ? translate(resolveStatusTitleKey(phase)) : promptLabel}
      </span>
      {isBusyPhase ? (
        <Loader2
          size={21}
          strokeWidth={1.8}
          className="animate-spin"
          aria-hidden="true"
        />
      ) : null}
    </button>
  );
}

function ArcaneConnectErrorActions(properties: {
  errorMessage?: string;
  onRetry: () => void;
  onChangeWallet: () => void;
}) {
  const { t: translate } = useTranslation("common");

  return (
    <div className="arcane-connect-error" role="alert">
      <p className="arcane-connect-error__message">
        {properties.errorMessage ?? translate("connectScreenSetupFailed")}
      </p>
      <div className="arcane-connect-actions">
        <button
          type="button"
          className="arcane-connect-primary"
          onClick={properties.onRetry}
        >
          <span>{translate("connectScreenRetry")}</span>
          <RefreshCcw size={20} strokeWidth={1.8} />
        </button>
        <button
          type="button"
          className="arcane-connect-secondary"
          onClick={properties.onChangeWallet}
        >
          <span>{translate("connectScreenReconnectFreighter")}</span>
        </button>
      </div>
    </div>
  );
}

export function ArcaneConnectScreen({
  phase,
  connectDisabled,
  isConnectingWallet,
  isFreighterAvailable,
  errorMessage,
  onConnectWallet,
  onRetry,
  onChangeWallet,
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
            <p>{translate("connectScreenDescription")}</p>
          </div>

          {isErrorPhase ? (
            <ArcaneConnectErrorActions
              errorMessage={errorMessage}
              onRetry={onRetry}
              onChangeWallet={onChangeWallet}
            />
          ) : (
            <ArcaneConnectPrimaryAction
              phase={phase}
              connectDisabled={connectDisabled}
              isConnectingWallet={isConnectingWallet}
              isBusyPhase={isBusyPhase}
              isFreighterAvailable={isFreighterAvailable}
              onConnectWallet={onConnectWallet}
            />
          )}
        </div>

        <aside className="arcane-connect-visual" aria-hidden="true">
          <ArcaneShaderGradient />
        </aside>
      </section>
    </main>
  );
}
