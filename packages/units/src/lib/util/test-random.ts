import { webcrypto } from 'node:crypto';
import type { Decimal } from 'util/helpers';

export function randomInt(min: number, max: number): Decimal {
  const range = max - min + 1;
  const array = new Uint32Array(1);
  webcrypto.getRandomValues(array);
  return `${min + (array[0] % range)}` as Decimal;
}

export function randomDecimal(min: number, max: number, decimals: number): Decimal {
  const intPart = randomInt(min, max);
  const fracMax = 10 ** decimals - 1;
  const array = new Uint32Array(1);
  webcrypto.getRandomValues(array);
  const fracPart = array[0] % (fracMax + 1);
  return `${intPart}.${String(fracPart).padStart(decimals, '0')}` as Decimal;
}
