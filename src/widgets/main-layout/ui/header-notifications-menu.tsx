import { useEffect, useRef } from "react";
import { Bell, BellOff } from "lucide-react";
import { useTranslation } from "react-i18next";

interface HeaderNotificationsMenuProperties {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HeaderNotificationsMenu({
  isOpen,
  onOpenChange,
}: HeaderNotificationsMenuProperties) {
  const { t: translate } = useTranslation("common");
  const menuReference = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!menuReference.current?.contains(event.target as Node)) {
        onOpenChange(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onOpenChange]);

  return (
    <div className="notification-menu" ref={menuReference}>
      <button
        type="button"
        className="ui-icon-button"
        aria-label={translate("notifications")}
        title={translate("notifications")}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        data-open={isOpen ? "true" : undefined}
        onClick={() => {
          onOpenChange(!isOpen);
        }}
      >
        <Bell size={18} strokeWidth={1.5} />
      </button>

      {isOpen ? (
        <div
          className="notification-menu__popover"
          role="dialog"
          aria-label={translate("inbox")}
        >
          <h2 className="notification-menu__title">{translate("inbox")}</h2>
          <div className="notification-menu__divider" />
          <div className="notification-menu__empty">
            <BellOff size={40} strokeWidth={1.5} />
            <p>{translate("noNotificationsYet")}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
