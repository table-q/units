import type { SignedParam, UNIT, Unit } from 'unit';
import { Errors } from 'util/errors';
import { isPositiveInteger } from 'util/helpers';
import type { Value } from 'value';
import { cleanup } from 'value/cleanup';
import { useContext, useMutableValue, useUnit, useValue } from 'value/hooks';

declare module '@table-q/units' {
  interface Value<Signed, U, Decimals> {
    scale<ToDecimals extends number>(toDecimals: ToDecimals): Value<Signed, U, ToDecimals>;
  }
}

export function scale<
  Signed extends SignedParam,
  U extends UNIT,
  Decimals extends number,
  ToDecimals extends number,
>(this: Value<Signed, U, Decimals>, toDecimals: ToDecimals): Value<Signed, U, ToDecimals> {
  if (!isPositiveInteger(toDecimals)) {
    throw Errors.INVALID_TYPE('toDecimals', 'positive integer');
  }
  const toUnit = useUnit(this).clone({ decimals: toDecimals }) as Unit<Signed, U, ToDecimals>;
  const fromDecimals: number = useContext(this).decimals;
  const ret = toUnit.createValue('0');
  const r = useMutableValue(ret);
  const { numerator, denominator } = useValue(this);
  r.numerator = numerator;
  r.denominator = denominator;
  if (fromDecimals === toDecimals) {
    return cleanup(ret);
  }
  const thisDec = BigInt(fromDecimals);
  const toDec = BigInt(toDecimals);
  if (thisDec > toDec) {
    r.denominator *= 10n ** (thisDec - toDec);
  } else {
    r.numerator *= 10n ** (toDec - thisDec);
  }
  return cleanup(ret);
}

export function extend(proto: Value) {
  proto.scale = function (this: Value, toDecimals: number) {
    return scale.apply(this, [toDecimals]);
  } as Value['scale'];
}
