import React from "react";
import { useTranslation } from "react-i18next";
import "./relay-waiting-status.css";

export function RelayWaitingStatus(): React.JSX.Element {
  const { t: translate } = useTranslation("relay");
  return (
    <p className="relay-waiting-status" role="status">
      {translate("waitingForProtocol")}
    </p>
  );
}
