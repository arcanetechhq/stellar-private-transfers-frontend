let custodianIntent = 0;

export function beginCustodianIntent(): number {
  custodianIntent += 1;
  return custodianIntent;
}

export function isCurrentCustodianIntent(token: number): boolean {
  return token === custodianIntent;
}
