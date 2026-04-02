export function computeReceivedAmount(amount: string): number {
  if (!amount || Number.isNaN(Number.parseFloat(amount))) {
    return 0;
  }
  return Number.parseFloat(amount);
}
