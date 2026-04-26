import type { SignedType, UNIT } from 'unit';
import { SCALAR, type SignedParam } from 'unit';
import { Errors } from 'util/errors';
import { isString, type Numeric } from 'util/helpers';
import type { Scalar, Value } from 'value';
import { cleanup } from 'value/cleanup';
import { useContext, useMutableValue, useValue } from 'value/hooks';

declare module '@table-q/units' {
  interface Value<Signed, U, Decimals> {
    div(value: Value<SignedType<Signed>, U>): Scalar;
    div(value: Numeric | Scalar): Value<Signed, U, Decimals>;
  }
}

export function div<Signed extends SignedParam, U extends UNIT, Decimals extends number>(
  this: Value<Signed, U, Decimals>,
  value: Numeric | Scalar | Value<SignedParam, U>,
): Value<Signed, U, Decimals> | Scalar {
  if (
    !isString(value) &&
    useContext(value as Value).kind !== 'SCALAR' &&
    useContext(value as Value).kind === this.kind()
  ) {
    const divisor = (value as Value<SignedParam, U>).scale(this.decimals());
    const ret = SCALAR.unit.createValue('0') as Scalar;
    const r = useMutableValue(ret);
    const thisValue = useValue(this);
    const divisorValue = useValue(divisor);
    r.numerator = thisValue.numerator * divisorValue.denominator;
    r.denominator = thisValue.denominator * divisorValue.numerator;
    return cleanup(ret);
  }
  let param = value as Scalar;
  const ret = this.clone();
  if (!isString(param)) {
    if (useContext(param).kind !== 'SCALAR') {
      throw Errors.INVALID_TYPE('value', 'SCALAR');
    }
  } else {
    param = SCALAR(value as Numeric);
  }
  const retValue = useMutableValue(ret);
  const { numerator, denominator } = useValue(param);
  retValue.numerator *= denominator;
  retValue.denominator *= numerator;
  return cleanup(ret);
}

export function extend(proto: Value) {
  proto.div = function (this: Value, value: Numeric | Scalar | Value) {
    return div.apply(this, [value]);
  } as Value['div'];
}
