export function isString(param: unknown): param is string {
  return typeof param === 'string';
}

export function isPositiveInteger(number: number) {
  return Number.isSafeInteger(number) && number >= 0;
}

export function isPrecision(number: number | Infinity, decimals: number) {
  const _number = number as number;
  return (
    (Number.isSafeInteger(number) && _number > 0 && _number >= decimals) ||
    _number === Number.POSITIVE_INFINITY
  );
}

export function isBitSize(number: number) {
  return (Number.isSafeInteger(number) && number > 0) || number === Number.POSITIVE_INFINITY;
}

export function gcd(num1: bigint, num2: bigint): bigint {
  if (num1 === 1n || num2 === 1n) {
    return 1n;
  }
  let bg = num1 > num2 ? num1 : num2;
  let sm = bg === num1 ? num2 : num1;
  while (sm !== 0n) {
    const temp = sm;
    sm = bg % sm;
    bg = temp;
  }
  return bg;
}

export function isRepeatingDecimal(denominator: bigint) {
  const safeDivisors = new Set([2n, 5n]);
  let divisor = 2n;
  let n = denominator;
  while (n >= 2) {
    if (n % divisor === 0n) {
      if (!safeDivisors.has(divisor)) {
        return true;
      }
      n = n / divisor;
    } else {
      divisor += 1n;
    }
  }
  return false;
}

export const DATA_SYMBOL = Symbol('DATA_SYMBOL');

export type Fraction = `${number | bigint}/${number | bigint}`;

export type Decimal = `${number | bigint}`;

export type Numeric = Decimal | Fraction;

// biome-ignore lint/complexity/noBannedTypes: intentional
export interface Infinity extends Number {}
