const ADDRESS_SHORT_MAX_LEN = 14;
const ADDRESS_HEAD_LEN = 8;
const ADDRESS_TAIL_LEN = 6;

export function shortenAddressLineForDisplay(address: string): string {
  if (address.length <= ADDRESS_SHORT_MAX_LEN) {
    return address;
  }
  return `${address.slice(0, ADDRESS_HEAD_LEN)}…${address.slice(-ADDRESS_TAIL_LEN)}`;
}
