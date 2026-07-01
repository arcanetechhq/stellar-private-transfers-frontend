import { Wallet } from "lucide-react";
import { WalletInstallBadge } from "./wallet-install-badge";

type WalletPickerOptionButtonProperties = {
  name: string;
  description?: string;
  badge?: string;
  iconUrl?: string;
  isAvailable: boolean;
  isConnecting: boolean;
  disabled: boolean;
  onSelect: () => void;
};

export function WalletPickerOptionButton({
  name,
  description,
  badge,
  iconUrl,
  isAvailable,
  isConnecting,
  disabled,
  onSelect,
}: WalletPickerOptionButtonProperties) {
  return (
    <button
      type="button"
      className="stellar-wallet-option"
      data-connecting={isConnecting ? "true" : undefined}
      data-unavailable={!isAvailable ? "true" : undefined}
      disabled={disabled}
      onClick={onSelect}
    >
      <span className="stellar-wallet-option__icon" aria-hidden="true">
        {iconUrl ? (
          <img
            className="stellar-wallet-option__icon-image"
            src={iconUrl}
            alt=""
            loading="lazy"
          />
        ) : (
          <Wallet size={20} strokeWidth={1.6} />
        )}
      </span>
      <span className="stellar-wallet-option__copy">
        <span className="stellar-wallet-option__name-row">
          <span className="stellar-wallet-option__name">{name}</span>
          {!isAvailable ? <WalletInstallBadge /> : null}
        </span>
        {description ? (
          <span className="stellar-wallet-option__description">
            {description}
          </span>
        ) : null}
      </span>
      {badge ? (
        <span className="stellar-wallet-option__badge">{badge}</span>
      ) : null}
    </button>
  );
}
