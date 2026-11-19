const SIGN_REQUEST_TTL_SECONDS = 540;

export function custodianSignRequestOptions(): { expiry: number } {
  return { expiry: SIGN_REQUEST_TTL_SECONDS };
}
