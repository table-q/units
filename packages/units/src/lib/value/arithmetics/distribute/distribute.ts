import type { SignedParam, UNIT } from 'unit';
import { Errors } from 'util/errors';
import { isPositiveInteger } from 'util/helpers';
import type { Value } from 'value';
import { useUnit } from 'value/hooks';
import type { ROUNDING_MODE } from 'value/rounding/rounding';
import { RoundingMode } from 'value/rounding/rounding';

declare module '@table-q/units' {
  interface Value<Signed, U, Decimals> {
    distribute(
      count: number,
      roundingMode?: ROUNDING_MODE,
      roundingDecimalPlaces?: number,
    ): Value<Signed, U, Decimals>[];
  }
}

export function distribute<Signed extends SignedParam, U extends UNIT, Decimals extends number>(
  this: Value<Signed, U, Decimals>,
  count: number,
  roundingMode: ROUNDING_MODE = RoundingMode.THROW,
  roundingDecimalPlaces = 0,
): Value<Signed, U, Decimals>[] {
  type AnySignValue = Value<SignedParam, U>;
  if (!isPositiveInteger(count)) {
    throw Errors.INVALID_TYPE('count', 'positive integer');
  }
  if (count === 0) {
    return [];
  }
  const val = this.round(roundingMode, roundingDecimalPlaces);
  const div = val.div(`${count}`).round('ROUND_DOWN');
  let mod = val.sub(div.mul(`${count}`) as AnySignValue).abs();
  const ret = [] as Value<Signed, U, Decimals>[];
  const unit = useUnit(this).fromBigInt(1);
  for (let i = 0; i < count; i += 1) {
    let v = div;
    if (mod.gt('0')) {
      mod = mod.sub(unit);
      v = v[val.isNegative() ? 'sub' : 'add'](unit);
    } else {
      v = v.clone();
    }
    ret.push(v);
  }
  return ret;
}

export function extend(proto: Value) {
  proto.distribute = function (count, roundingMode?, roundingDecimalPlaces?) {
    return distribute.apply(this, [count, roundingMode, roundingDecimalPlaces]);
  };
}
