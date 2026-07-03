export function isNumericDecimalInput(value: string) {
  let decimalPointCount = 0;

  for (const character of value) {
    if (character === "." && decimalPointCount >= 1) {
      return false;
    }

    if (character === ".") {
      decimalPointCount += 1;
      continue;
    }

    if (character < "0" || character > "9") {
      return false;
    }
  }

  return true;
}
