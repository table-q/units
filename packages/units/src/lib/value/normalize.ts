import type { SignedType, UNIT } from 'unit';
import { gcd } from 'util/helpers';
import type { Value } from 'value';
import { cleanup } from 'value/cleanup';
import { useMutableValue } from 'value/hooks';

declare module '@table-q/units' {
  interface Value<Signed, U, Decimals> {
    normalize(): Value<Signed, U, Decimals>;
  }
}

export function normalize<Signed extends SignedType, U extends UNIT, Decimals extends number>(
  this: Value<Signed, U, Decimals>,
): Value<Signed, U, Decimals> {
  const value = useMutableValue(this);
  const _gcd = gcd(value.numerator, value.denominator);
  value.numerator /= _gcd;
  value.denominator /= _gcd;
  return cleanup(this);
}

export function extend(proto: Value) {
  proto.normalize = function () {
    return normalize.apply(this);
  };
}
