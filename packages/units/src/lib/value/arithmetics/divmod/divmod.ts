import type { UNIT } from 'unit';
import { SCALAR, type SignedParam } from 'unit';
import { Errors } from 'util/errors';
import { isString, type Numeric } from 'util/helpers';
import type { Scalar, Value } from 'value';
import { cleanup } from 'value/cleanup';
import { useContext, useMutableValue, useValue } from 'value/hooks';

declare module '@table-q/units' {
  interface Value<Signed, U, Decimals> {
    divmod(value: Numeric | Scalar): [Value<Signed, U, Decimals>, Value<Signed, U, Decimals>];
  }
}

export function divmod<Signed extends SignedParam, U extends UNIT, Decimals extends number>(
  this: Value<Signed, U, Decimals>,
  value: Numeric | Scalar,
): [Value<Signed, U, Decimals>, Value<Signed, U, Decimals>] {
  const { decimals, signed } = useContext(this);
  let param = value as Scalar;
  if (!isString(param)) {
    if (useContext(param).kind !== 'SCALAR') {
      throw Errors.INVALID_TYPE('value', 'SCALAR');
    }
  } else {
    param = SCALAR(value);
  }
  const { numerator, denominator, unit } = useValue(this);
  const { numerator: pNumerator, denominator: pDenominator } = useValue(param);
  if (pNumerator === 0n) {
    throw Errors.DIVISION_BY_ZERO();
  }
  const negative = pNumerator < 0n !== pDenominator < 0n;
  if (!signed && negative) {
    throw Errors.INVALID_CONVERSION('SIGNED', 'UNSIGNED');
  }
  const n = numerator * pDenominator;
  const d = denominator * pNumerator;
  const scale = 10n ** BigInt(decimals);
  const q = n / (d * scale);
  const quotient = unit.fromBigInt(q * scale);
  const remainder = this.clone();
  const r = useMutableValue(remainder);
  r.numerator = numerator * pDenominator - q * pNumerator * denominator * scale;
  r.denominator = denominator * pDenominator;
  return [quotient, cleanup(remainder)];
}

export function extend(proto: Value) {
  proto.divmod = function (value) {
    return divmod.apply(this, [value]);
  };
}
