import { DATA_SYMBOL as _d } from 'util/helpers';
import { createValueInstance, type Value } from 'value';
import { useMutableValue } from 'value/hooks';

declare module '@table-q/units' {
  interface Value<Signed, U, Decimals> {
    clone(): Value<Signed, U, Decimals>;
  }
}

export function extend(proto: Value) {
  proto.clone = function () {
    const val = createValueInstance('0', this[_d].unit, true);
    const m = useMutableValue(val);
    m.numerator = this[_d].numerator;
    m.denominator = this[_d].denominator;
    return val;
  };
}
