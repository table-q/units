import type { UNIT, Unit } from 'unit';
import { SCALAR, type SignedParam, type SignedTypeInverse } from 'unit';
import { Errors } from 'util/errors';
import type { Numeric } from 'util/helpers';
import type { Value } from 'value';
import { cleanup } from 'value/cleanup';
import { useContext, useMutableValue, useValue } from 'value/hooks';
import type { ROUNDING_MODE } from 'value/rounding/rounding';

type ValueConstructor<Signed extends SignedParam, U extends UNIT, Decimals extends number> = ((
  value: Numeric | Value<Signed, U>,
  roundingMode?: ROUNDING_MODE,
  roundingDecimalPlaces?: number,
) => Value<Signed, U, Decimals>) & {
  unit: Unit<Signed, U, Decimals>;
};

declare module '@table-q/units' {
  interface Value<Signed, U, Decimals> {
    convert<ToSigned extends SignedTypeInverse<Signed>, To extends UNIT, ToDecimals extends number>(
      To: ValueConstructor<ToSigned, To, ToDecimals>,
      rate?: Numeric,
    ): Value<ToSigned, To, ToDecimals>;
  }
}

export function convert<
  Signed extends SignedParam,
  U extends UNIT,
  Decimals extends number,
  ToSigned extends SignedTypeInverse<Signed>,
  To extends UNIT,
  ToDecimals extends number,
>(
  this: Value<Signed, U, Decimals>,
  To: ValueConstructor<ToSigned, To, ToDecimals>,
  rate: Numeric,
): Value<ToSigned, To, ToDecimals> {
  const toUnit = To.unit;
  const decimals: number = useContext(this).decimals;
  const param = SCALAR(rate);
  const ret = toUnit.createValue('0');
  if (useContext(this).signed && !useContext(ret).signed) {
    throw Errors.INVALID_CONVERSION('SIGNED', 'UNSIGNED');
  }
  const toDecimals: number = useContext(ret).decimals;
  const { numerator, denominator } = useValue(this);
  const r = useMutableValue(ret);
  if (decimals === toDecimals && rate === '1') {
    r.numerator = numerator;
    r.denominator = denominator;
    return cleanup(ret);
  }
  const p = useMutableValue(param);
  const thisDec = BigInt(decimals);
  const toDec = BigInt(toDecimals);
  if (thisDec > toDec) {
    p.denominator *= 10n ** (thisDec - toDec);
  } else if (thisDec < toDec) {
    p.numerator *= 10n ** (toDec - thisDec);
  }
  r.numerator = p.numerator * numerator;
  r.denominator = p.denominator * denominator;
  return cleanup(ret);
}

export function extend(proto: Value) {
  proto.convert = function (
    this: Value,
    To: ValueConstructor<SignedParam, UNIT, number>,
    rate: Numeric = '1',
  ) {
    return convert.apply(this, [To, rate]);
  } as Value['convert'];
}
