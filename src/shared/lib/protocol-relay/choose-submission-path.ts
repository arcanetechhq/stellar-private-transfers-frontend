import { SUBMISSION_PATH, type SubmissionPath } from "./types.js";

const ZERO_PUBLIC_DEPOSIT = 0n;

export function chooseSubmissionPath(
  publicDepositAmount: string,
): SubmissionPath {
  return BigInt(publicDepositAmount) > ZERO_PUBLIC_DEPOSIT
    ? SUBMISSION_PATH.direct
    : SUBMISSION_PATH.relay;
}
