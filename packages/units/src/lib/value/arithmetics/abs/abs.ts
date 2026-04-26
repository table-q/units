import type { SignedParam, UNIT } from 'unit';
import type { Value } from 'value';
import { cleanup } from 'value/cleanup';
import { useMutableValue } from 'value/hooks';

declare module '@table-q/units' {
  interface Value<Signed, U, Decimals> {
    abs(): Value<Signed, U, Decimals>;
  }
}

export function abs<Signed extends SignedParam, U extends UNIT, Decimals extends number>(
  this: Value<Signed, U, Decimals>,
): Value<Signed, U, Decimals> {
  const ret = this.clone();
  if (!ret.isNegative()) {
    return ret as Value<Signed, U, Decimals>;
  }
  const value = useMutableValue(ret);
  value.numerator *= -1n;
  return cleanup(ret);
}

export function extend(proto: Value) {
  proto.abs = function () {
    return abs.apply(this);
  };
}
