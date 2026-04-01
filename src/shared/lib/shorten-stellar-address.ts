const MIN_LENGTH_BEFORE_SHORTEN = 12;
const SHORT_PREFIX_LENGTH = 5;
const SHORT_SUFFIX_LENGTH = 4;

export function shortenStellarAddress(address: string): string {
  if (address.length <= MIN_LENGTH_BEFORE_SHORTEN) {
    return address;
  }
  const suffixStart = address.length - SHORT_SUFFIX_LENGTH;
  return `${address.slice(0, SHORT_PREFIX_LENGTH)}...${address.slice(suffixStart)}`;
}
