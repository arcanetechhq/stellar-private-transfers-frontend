import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { selectWalletPublicKey } from "@/entities/wallet";
import { createResumeRelayPorts } from "../lib/create-app-relay-ports.js";
import { refreshPendingRelayWait } from "../lib/refresh-pending-relay-wait.js";
import { RelayWaitingStatus } from "./relay-waiting-status.js";
import "./resume-pending-private-operations.css";

const POLL_INTERVAL_MS = 2000;

export function ResumePendingPrivateOperations(): React.JSX.Element {
  const dispatch = useAppDispatch();
  const walletPublicKey = useAppSelector(selectWalletPublicKey);
  const [isWaiting, setIsWaiting] = useState(false);

  useEffect(() => {
    const trimmed = walletPublicKey?.trim();
    if (!trimmed) {
      setIsWaiting(false);
      return;
    }
    const ports = createResumeRelayPorts(dispatch);
    const poll = () => {
      refreshPendingRelayWait({
        ports,
        walletPublicKey: trimmed,
        setIsWaiting,
      }).catch(() => {
        return;
      });
    };
    poll();
    const intervalId = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      clearInterval(intervalId);
    };
  }, [dispatch, walletPublicKey]);

  if (!isWaiting) {
    return <></>;
  }
  return (
    <div className="relay-waiting-status-shell">
      <RelayWaitingStatus />
    </div>
  );
}
