import type { AppDispatch } from "@/store";

export type CustodianResumeResult = "restored" | "absent" | "failed";

export type CustodianLeaveInput = {
  dispatch: AppDispatch;
  fireblocksPublicKey: string | undefined;
};

export type CustodianSessionPort = {
  hasSelection: () => boolean;
  resume: (dispatch: AppDispatch) => Promise<CustodianResumeResult>;
  leave: (input: CustodianLeaveInput) => Promise<void>;
};

const idleCustodianSessionPort: CustodianSessionPort = {
  hasSelection: () => false,
  resume: () => Promise.resolve("absent"),
  leave: () => Promise.resolve(),
};

let activeCustodianSessionPort = idleCustodianSessionPort;

export function registerCustodianSessionPort(port: CustodianSessionPort): void {
  activeCustodianSessionPort = port;
}

export function custodianSessionPort(): CustodianSessionPort {
  return activeCustodianSessionPort;
}
