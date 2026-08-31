import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { selectWalletPublicKey } from "@/entities/wallet";
import { resumePendingOperations } from "@/shared/lib/protocol-relay";
import { createResumeRelayPorts } from "../lib/create-app-relay-ports.js";

const POLL_INTERVAL_MS = 2000;

export function ResumePendingPrivateOperations() {
  const dispatch = useAppDispatch();
  const walletPublicKey = useAppSelector(selectWalletPublicKey);

  useEffect(() => {
    const trimmed = walletPublicKey?.trim();
    if (!trimmed) {
      return;
    }
    const ports = createResumeRelayPorts(dispatch);
    const poll = () => {
      resumePendingOperations({
        ports,
        walletPublicKey: trimmed,
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
}
