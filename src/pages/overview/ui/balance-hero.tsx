import React, { useState } from "react";
import "./balance-hero.css";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import {
  Loader2,
  ArrowUpFromLine,
  UserPlus,
  EyeOff,
  RefreshCw,
  ArrowDownIcon,
  ArrowUpRight,
} from "lucide-react";
import {
  useWalletPrivateAddress,
} from "@/features/register-private-address";

type ActionButtonVariant = "primary" | "outline";

interface ActionButtonProperties {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  variant: ActionButtonVariant;
}

function ActionButton(properties: ActionButtonProperties) {
  const { to, label, icon: Icon, variant } = properties;

  return (
    <Link className="min-w-0" to={to}>
      <button
        type="button"
        className="balance-card__action-button"
        data-variant={variant}
      >
        <Icon />
        <span>{label}</span>
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
  return (
    <button
      type="button"
      disabled={disabled}
      className="balance-card__action-button"
      data-variant="primary"
      onClick={onClick}
    >
      {isLoading ? (
        <Loader2 className="animate-spin" />
      ) : (
        <UserPlus />
      )}
      <span>{label}</span>
    </button>
  );
}

function BalanceAmount({ value }: { value: string }) {
  const match = value.match(/^(.*?)(\.\d{2})$/);

  if (!match) {
    return <>{value}</>;
  }

  return (
    <>
      {match[1]}
      <span className="balance-card__amount-cents">{match[2]}</span>
    </>
  );
}

interface BalanceVisibilityActionsProperties {
  hidden: boolean;
  refreshing: boolean;
  onToggleHidden: () => void;
  onRefresh: () => void;
  showBalanceLabel: string;
  hideBalanceLabel: string;
  refreshBalanceLabel: string;
}

function BalanceVisibilityActions({
  hidden,
  refreshing,
  onToggleHidden,
  onRefresh,
  showBalanceLabel,
  hideBalanceLabel,
  refreshBalanceLabel,
}: BalanceVisibilityActionsProperties) {
  return (
    <span className="balance-card__visibility-actions">
      <button
        type="button"
        aria-label={hidden ? showBalanceLabel : hideBalanceLabel}
        title={hidden ? showBalanceLabel : hideBalanceLabel}
        className="balance-card__icon-button"
        data-active={hidden}
        onClick={onToggleHidden}
      >
        <EyeOff />
      </button>
      <button
        type="button"
        aria-label={refreshBalanceLabel}
        title={refreshBalanceLabel}
        className="balance-card__icon-button balance-card__refresh-button"
        data-active={refreshing}
        onClick={onRefresh}
      >
        <RefreshCw />
      </button>
    </span>
  );
}

interface BalanceHeroProperties {
  balance: string;
  assetCount: number;
}

const BALANCE_REFRESH_ANIMATION_MS = 700;

export function BalanceHero(properties: BalanceHeroProperties) {
  const { balance } = properties;
  const { t: translateOverview } = useTranslation("overview");
  const [hidden, setHidden] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const {
    actionsEnabled,
    isRegistryLoading,
    registryStatus,
    canOpenRegistryRegistration,
    openRegistryRegistrationModal,
  } = useWalletPrivateAddress();
  const isRegistryChecking =
    isRegistryLoading || registryStatus === "checking";

  function handleRefresh() {
    setRefreshing(true);
    window.setTimeout(() => {
      setRefreshing(false);
    }, BALANCE_REFRESH_ANIMATION_MS);
  }

  return (
    <section className="balance-card ui-card w-full shrink-0">
      <div className="balance-card__summary">
        <p className="balance-card__label">
          {translateOverview("totalBalance")}
        </p>
        <div className="balance-card__amount-row">
          <h2 className="balance-card__amount">
            {hidden ? (
              "********"
            ) : (
              <>
                $<BalanceAmount value={balance} />
              </>
            )}
          </h2>
          <BalanceVisibilityActions
            hidden={hidden}
            refreshing={refreshing}
            onToggleHidden={() => {
              setHidden((current) => !current);
            }}
            onRefresh={handleRefresh}
            showBalanceLabel={translateOverview("showBalance")}
            hideBalanceLabel={translateOverview("hideBalance")}
            refreshBalanceLabel={translateOverview("refreshBalance")}
          />
        </div>
      </div>
      {actionsEnabled ? (
        <div className="balance-card__actions" data-count="3">
          <ActionButton
            to="/deposit"
            label={translateOverview("deposit")}
            icon={ArrowDownIcon}
            variant="primary"
          />
          <ActionButton
            to="/create-transfer"
            label={translateOverview("privateSend")}
            icon={ArrowUpRight}
            variant="outline"
          />
          <ActionButton
            to="/withdraw"
            label={translateOverview("withdraw")}
            icon={ArrowUpFromLine}
            variant="outline"
          />
        </div>
      ) : (
        <div className="balance-card__actions" data-count="1">
          <RegisterAccountButton
            label={translateOverview("registerAccount")}
            disabled={!canOpenRegistryRegistration}
            isLoading={isRegistryChecking}
            onClick={openRegistryRegistrationModal}
          />
        </div>
      )}
    </section>
  );
}
