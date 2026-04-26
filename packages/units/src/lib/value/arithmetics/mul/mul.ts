import type { UNIT } from 'unit';
import { SCALAR, type SignedParam } from 'unit';
import { Errors } from 'util/errors';
import { isString, type Numeric } from 'util/helpers';
import type { Scalar, Value } from 'value';
import { cleanup } from 'value/cleanup';
import { useContext, useMutableValue, useValue } from 'value/hooks';

declare module '@table-q/units' {
  interface Value<Signed, U, Decimals> {
    mul(value: Numeric | Scalar): Value<Signed, U, Decimals>;
  }
}

export function mul<Signed extends SignedParam, U extends UNIT, Decimals extends number>(
  this: Value<Signed, U, Decimals>,
  value: Numeric | Scalar,
): Value<Signed, U, Decimals> {
  let param = value as Scalar;
  const ret = this.clone();
  if (!isString(param)) {
    if (useContext(param).kind !== 'SCALAR') {
      throw Errors.INVALID_TYPE('value', 'SCALAR');
    }
  } else {
    param = SCALAR(value);
  }
  const retValue = useMutableValue(ret);
  const { numerator, denominator } = useValue(param);
  retValue.numerator *= numerator;
  retValue.denominator *= denominator;
  return cleanup(ret);
}

export function extend(proto: Value) {
  proto.mul = function (value) {
    return mul.apply(this, [value]);
  };
}
