import React from "react";
import {
  X,
  Bell,
  AlertCircle,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import {
  MOCK_NOTIFICATIONS,
  type NotificationRecord,
} from "./notifications-modal-mock-data";

type NotificationsModalProperties = {
  isOpen: boolean;
  onClose: () => void;
};

function NotificationsEmptyState() {
  const { t: translate } = useTranslation("common");
  return (
    <div className="p-8 text-center">
      <Bell className="mx-auto mb-3 h-12 w-12 text-gray-300" />
      <p className="mb-1 text-sm leading-5 font-medium text-gray-500">
        {translate("noNotifications")}
      </p>
      <p className="text-xs leading-[18px] text-gray-400">{translate("allCaughtUp")}</p>
    </div>
  );
}

function notificationIcon(type: NotificationRecord["type"]) {
  switch (type) {
    case "deposit": {
      return <ArrowDownLeft className="h-5 w-5" style={{ color: "#10B981" }} />;
    }
    case "withdrawal": {
      return <ArrowUpRight className="h-5 w-5" style={{ color: "#F59E0B" }} />;
    }
    case "transfer": {
      return <ArrowUpRight className="h-5 w-5" style={{ color: "#3B82F6" }} />;
    }
    case "system": {
      return <AlertCircle className="h-5 w-5" style={{ color: "#6B7280" }} />;
    }
  }
}

type NotificationItemProperties = {
  notification: NotificationRecord;
  isLast: boolean;
  onOpenNotification: (transactionId: string | undefined) => void;
};

function NotificationItem({
  notification,
  isLast,
  onOpenNotification,
}: NotificationItemProperties) {
  return (
    <div
      className={`cursor-pointer p-4 transition-colors hover:bg-gray-50 ${
        notification.read ? "bg-transparent" : "bg-gray-50"
      } ${isLast ? "" : "border-b border-gray-200"}`}
      onClick={() => onOpenNotification(notification.transactionId)}
    >
      <div className="flex gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
          {notificationIcon(notification.type)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-start justify-between gap-2">
            <h3 className="text-sm leading-5 font-medium text-gray-900">
              {notification.title}
            </h3>
            {!notification.read && (
              <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
            )}
          </div>
          <p className="mb-1 text-[13px] leading-[18px] text-gray-500">
            {notification.message}
          </p>
          <p className="text-xs leading-4 text-gray-400">{notification.timestamp}</p>
        </div>
      </div>
    </div>
  );
}

export function NotificationsModal({
  isOpen,
  onClose,
}: NotificationsModalProperties) {
  const navigate = useNavigate();
  const { t: translate } = useTranslation("common");

  if (!isOpen) {
    return;
  }

  const unreadCount = MOCK_NOTIFICATIONS.filter((notification) => !notification.read).length;
  const hasNotifications = MOCK_NOTIFICATIONS.length > 0;

  const openNotification = (transactionId: string | undefined) => {
    if (!transactionId) {
      return;
    }

    navigate(`/transaction/${transactionId}`);
    onClose();
  };

  return (
    <React.Fragment>
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />

      <div className="fixed top-20 right-4 z-50 w-full max-w-md rounded-xl border border-gray-200 bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-gray-700" />
            <h2 className="text-lg leading-7 font-semibold text-gray-900">{translate("notifications")}</h2>
            {unreadCount > 0 && (
              <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-medium text-white">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-500 transition-colors hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[500px] overflow-y-auto">
          {hasNotifications ? (
            <div>
              {MOCK_NOTIFICATIONS.map((notification, index) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  isLast={index === MOCK_NOTIFICATIONS.length - 1}
                  onOpenNotification={openNotification}
                />
              ))}
            </div>
          ) : (
            <NotificationsEmptyState />
          )}
        </div>

        {hasNotifications && (
          <div className="border-t border-gray-200 p-3">
            <button
              type="button"
              className="w-full rounded-lg py-2 text-sm leading-5 font-medium text-blue-500 transition-colors hover:bg-blue-50"
            >
              {translate("markAllAsRead")}
            </button>
          </div>
        )}
      </div>
    </React.Fragment>
  );
}
