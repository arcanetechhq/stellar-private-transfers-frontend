const MIN_LENGTH_BEFORE_SHORTEN = 12;
const SHORT_PREFIX_LENGTH = 5;
const SHORT_SUFFIX_LENGTH = 4;

export function shortenStellarAddress(address: string, prefixLength: number = SHORT_PREFIX_LENGTH, suffixLength: number = SHORT_SUFFIX_LENGTH): string {
  if (address.length <= MIN_LENGTH_BEFORE_SHORTEN) {
    return address;
  }
  const suffixStart = address.length - suffixLength;
  return `${address.slice(0, prefixLength)}...${address.slice(suffixStart)}`;
}