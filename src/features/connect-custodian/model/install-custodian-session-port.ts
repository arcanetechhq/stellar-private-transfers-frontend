import {
  registerCustodianSessionPort,
  type CustodianSessionPort,
} from "@/entities/wallet";
import { leaveCustodianSession } from "./leave-custodian-session";
import { resumeCustodianSession } from "./resume-custodian-session";
import { readSelectedFireblocksAsset } from "./selected-fireblocks-asset";

export function installCustodianSessionPort(): void {
  const port: CustodianSessionPort = {
    hasSelection: () => readSelectedFireblocksAsset() !== undefined,
    resume: (dispatch) => resumeCustodianSession(dispatch),
    leave: (input) => leaveCustodianSession(input),
  };
  registerCustodianSessionPort(port);
}
