import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { Loader2, Send, Download, ArrowUpFromLine, UserPlus } from "lucide-react";
import {
  RegistryRegistrationModal,
  useWalletPrivateAddress,
} from "@/features/register-private-address";

const CARD_STYLE: React.CSSProperties = {
  border: "1px solid #E7EAF0",
  borderRadius: "20px",
  padding: "24px 36px",
  width: "50%",
  height: "260px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
};

const LABEL_STYLE: React.CSSProperties = {
  fontSize: "13px",
  lineHeight: "18px",
  color: "#667085",
  fontWeight: 500,
  textTransform: "uppercase",
  letterSpacing: "0.02em",
};

const BALANCE_AMOUNT_STYLE: React.CSSProperties = {
  fontSize: "48px",
  lineHeight: "56px",
  color: "#121826",
  letterSpacing: "-0.02em",
};

const SUBTITLE_STYLE: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: "20px",
  color: "#98A2B3",
};

const PRIMARY_BUTTON_STYLE: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "22px",
  fontWeight: 600,
  backgroundColor: "#111827",
  color: "#FFFFFF",
  borderRadius: "12px",
  height: "44px",
  minWidth: "145px",
  paddingLeft: "20px",
  paddingRight: "20px",
};

const SECONDARY_BUTTON_STYLE: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "22px",
  fontWeight: 600,
  backgroundColor: "#FFFFFF",
  color: "#111827",
  border: "1px solid #E7EAF0",
  borderRadius: "12px",
  height: "44px",
  width: "145px",
};

const DISABLED_PRIMARY_BUTTON_STYLE: React.CSSProperties = {
  cursor: "not-allowed",
  opacity: 0.45,
};

type ActionButtonVariant = "primary" | "secondary";

interface ActionButtonProperties {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  variant: ActionButtonVariant;
}

function ActionButton(properties: ActionButtonProperties) {
  const { to, label, icon: Icon, variant } = properties;
  const isPrimary = variant === "primary";
  const style = isPrimary ? PRIMARY_BUTTON_STYLE : SECONDARY_BUTTON_STYLE;

  function handleMouseEnter(event: React.MouseEvent<HTMLButtonElement>) {
    if (isPrimary) {
      event.currentTarget.style.backgroundColor = "#1F2937";
    } else {
      event.currentTarget.style.backgroundColor = "#F6F7F9";
      event.currentTarget.style.borderColor = "#D0D5DD";
    }
  }

  function handleMouseLeave(event: React.MouseEvent<HTMLButtonElement>) {
    if (isPrimary) {
      event.currentTarget.style.backgroundColor = "#111827";
    } else {
      event.currentTarget.style.backgroundColor = "#FFFFFF";
      event.currentTarget.style.borderColor = "#E7EAF0";
    }
  }

  return (
    <Link to={to}>
      <button
        type="button"
        className="flex items-center justify-center gap-2 transition-all"
        style={style}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Icon className="h-4 w-4" />
        {label}
      </button>
    </Link>
  );
}

interface RegisterAccountButtonProperties {
  label: string;
  disabled: boolean;
  isLoading: boolean;
  onClick: () => void;
}

function RegisterAccountButton({
  label,
  disabled,
  isLoading,
  onClick,
}: RegisterAccountButtonProperties) {
  const style = {
    ...PRIMARY_BUTTON_STYLE,
    ...(disabled ? DISABLED_PRIMARY_BUTTON_STYLE : undefined),
  };

  function handleMouseEnter(event: React.MouseEvent<HTMLButtonElement>) {
    if (disabled) {
      return;
    }
    event.currentTarget.style.backgroundColor = "#1F2937";
  }

  function handleMouseLeave(event: React.MouseEvent<HTMLButtonElement>) {
    if (disabled) {
      return;
    }
    event.currentTarget.style.backgroundColor = "#111827";
  }

  return (
    <button
      type="button"
      disabled={disabled}
      className="inline-flex items-center justify-center gap-2 transition-all"
      style={style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <UserPlus className="h-4 w-4" />
      )}
      {label}
    </button>
  );
}

interface BalanceHeroProperties {
  balance: string;
  assetCount: number;
}

export function BalanceHero(properties: BalanceHeroProperties) {
  const { balance, assetCount } = properties;
  const { t: translateOverview } = useTranslation("overview");
  const {
    actionsEnabled,
    isRegistryLoading,
    registryStatus,
    refreshRegistryStatus,
  } = useWalletPrivateAddress();
  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);
  const isRegistryChecking =
    isRegistryLoading || registryStatus === "checking";
  const canOpenRegistration =
    !actionsEnabled && !isRegistryChecking;

  return (
    <div className="rounded-xl bg-white" style={CARD_STYLE}>
      <div>
        <p className="mb-2" style={LABEL_STYLE}>
          {translateOverview("privateBalance")}
        </p>
        <div className="mb-1 flex items-baseline gap-3">
          <p className="font-semibold" style={BALANCE_AMOUNT_STYLE}>
            ${balance}
          </p>
        </div>
        <p style={SUBTITLE_STYLE}>
          {translateOverview("assetsInWallet", { count: assetCount })}
        </p>
      </div>
      {actionsEnabled ? (
        <div className="flex gap-3">
          <ActionButton
            to="/create-transfer"
            label={translateOverview("privateSend")}
            icon={Send}
            variant="primary"
          />
          <ActionButton
            to="/deposit"
            label={translateOverview("deposit")}
            icon={Download}
            variant="secondary"
          />
          <ActionButton
            to="/withdraw"
            label={translateOverview("withdraw")}
            icon={ArrowUpFromLine}
            variant="secondary"
          />
        </div>
      ) : (
        <React.Fragment>
          <RegisterAccountButton
            label={translateOverview("registerAccount")}
            disabled={!canOpenRegistration}
            isLoading={isRegistryChecking}
            onClick={() => setRegistrationModalOpen(true)}
          />
          <RegistryRegistrationModal
            open={registrationModalOpen && canOpenRegistration}
            onRegistered={() => {
              setRegistrationModalOpen(false);
              void refreshRegistryStatus();
            }}
          />
        </React.Fragment>
      )}
    </div>
  );
}
