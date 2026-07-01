import { ChevronDown, ChevronUp, Wallet } from "lucide-react";

type MainLayoutWalletTriggerProperties = {
  shortAddress: string;
  isOpen: boolean;
  onToggle: () => void;
};

export function MainLayoutWalletTrigger({
  shortAddress,
  isOpen,
  onToggle,
}: MainLayoutWalletTriggerProperties) {
  return (
    <button
      type="button"
      className="topbar-action user-menu"
      data-open={isOpen}
      aria-haspopup="menu"
      aria-expanded={isOpen}
      onClick={onToggle}
    >
      <span className="user-menu__wallet-icon" aria-hidden="true">
        <Wallet size={18} strokeWidth={1.6} />
      </span>
      <span className="user-menu__name">{shortAddress}</span>
      {isOpen ? (
        <ChevronUp size={18} strokeWidth={1.7} />
      ) : (
        <ChevronDown size={16} strokeWidth={1.5} />
      )}
    </button>
  );
}
