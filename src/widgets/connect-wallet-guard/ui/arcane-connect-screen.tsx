import { ArrowRight, Loader2, Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";
import Arcn from "@/shared/assets/logo-arcn";
import { ArcaneShaderGradient } from "./arcane-shader-gradient";
import "./arcane-connect-screen.css";

type ArcaneConnectScreenPhase = "prompt" | "connecting";

type ArcaneConnectScreenProperties = {
  phase: ArcaneConnectScreenPhase;
  connectDisabled: boolean;
  isConnectingWallet: boolean;
  onConnectWallet: () => void;
};

export function ArcaneConnectScreen({
  phase,
  connectDisabled,
  isConnectingWallet,
  onConnectWallet,
}: ArcaneConnectScreenProperties) {
  const { t: translate } = useTranslation("common");
  const isConnectingAccount = phase === "connecting";

  return (
    <main className="arcane-connect-screen">
      <section
        className="arcane-connect-shell"
        aria-label={translate("connectScreenAriaLabel")}
        aria-busy={isConnectingAccount}
      >
        <div className="arcane-connect-copy">
          <span className="arcane-connect-logo" aria-label="Arcane">
            <Arcn />
          </span>

          <div className="arcane-connect-heading">
            <h1>
              {translate("connectScreenTitle")}
            </h1>
            
            <p>
              {translate("connectScreenDescription")}
            </p>
          </div>

          {isConnectingAccount ? (
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
              <span>{translate("connectScreenConnectingTitle")}</span>
            </div>
          ) : (
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
          )}
        </div>

        <aside className="arcane-connect-visual" aria-hidden="true">
          <ArcaneShaderGradient />
        </aside>
      </section>
    </main>
  );
}
