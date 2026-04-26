import type { SignedType, UNIT } from 'unit';
import { Errors } from 'util/errors';
import type { Value } from 'value';
import { useContext, useMutableValue } from 'value/hooks';

export function cleanup<Signed extends SignedType, U extends UNIT, Decimals extends number>(
  that: Value<Signed, U, Decimals>,
): Value<Signed, U, Decimals> {
  const value = useMutableValue(that);
  const { signed } = useContext(that);
  if (value.denominator === 0n) {
    throw Errors.DIVISION_BY_ZERO();
  }
  const negative = value.numerator < 0n !== value.denominator < 0n;
  if (negative) {
    value.numerator = value.numerator < 0n ? value.numerator : value.numerator * -1n;
    value.denominator = value.denominator > 0n ? value.denominator : value.denominator * -1n;
  } else if (value.numerator < 0n && value.denominator < 0n) {
    value.numerator *= -1n;
    value.denominator *= -1n;
  }
  if (!signed && negative) {
    throw Errors.INVALID_CONVERSION('SIGNED', 'UNSIGNED');
  }
  return that;
}
