export function isNumericDecimalInput(value: string) {
  let decimalPointCount = 0;
  for (const character of value) {
    if (character === ".") {
      decimalPointCount += 1;
      if (decimalPointCount > 1) {
        return false;
      }
      continue;
    }
    if (character < "0" || character > "9") {
      return false;
    }
  }
  return true;
}
