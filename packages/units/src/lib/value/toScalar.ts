import type { SignedParam, UNIT } from 'unit';
import { SCALAR } from 'unit';
import type { Scalar, Value } from 'value';
import { cleanup } from 'value/cleanup';
import { useContext, useMutableValue, useValue } from 'value/hooks';

declare module '@table-q/units' {
  interface Value<Signed, U, Decimals> {
    toScalar(): Scalar;
  }
}

export function toScalar<Signed extends SignedParam, U extends UNIT, Decimals extends number>(
  this: Value<Signed, U, Decimals>,
): Scalar {
  const { numerator, denominator } = useValue(this);
  const { decimals } = useContext(this);
  const ret = SCALAR.unit.createValue('0') as Scalar;
  const r = useMutableValue(ret);
  r.numerator = numerator;
  r.denominator = denominator * 10n ** BigInt(decimals);
  return cleanup(ret);
}

export function extend(proto: Value) {
  proto.toScalar = function () {
    return toScalar.apply(this);
  };
}
