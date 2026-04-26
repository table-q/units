import type { SignedParam, UNIT } from 'unit';
import { Errors } from 'util/errors';
import { isPositiveInteger } from 'util/helpers';
import type { Value } from 'value';
import { cleanup } from 'value/cleanup';
import { useMutableValue, useValue } from 'value/hooks';

declare module '@table-q/units' {
  interface Value<Signed, U, Decimals> {
    pow(power: number): Value<Signed, U, Decimals>;
  }
}

export function pow<Signed extends SignedParam, U extends UNIT, Decimals extends number>(
  this: Value<Signed, U, Decimals>,
  power: number,
): Value<Signed, U, Decimals> {
  if (!isPositiveInteger(power)) {
    throw Errors.INVALID_TYPE('power', 'positive integer');
  }
  const value = useValue(this);
  if (power === 0) {
    return cleanup(value.unit.createValue('1'));
  }
  if (power === 1) {
    return cleanup(this.clone());
  }
  const ret = this.clone();
  const retValue = useMutableValue(ret);
  const _pow = BigInt(Math.abs(power));
  retValue.numerator **= _pow;
  retValue.denominator **= _pow;
  retValue.denominator *= (10n ** BigInt(this.decimals())) ** (_pow - 1n);
  return cleanup(ret);
}

export function extend(proto: Value) {
  proto.pow = function (power) {
    return pow.apply(this, [power]);
  };
}
