import type { SignedParam, SignedType, UNIT } from 'unit';
import { Errors } from 'util/errors';
import { isString, type Numeric } from 'util/helpers';
import type { Value } from 'value';
import { cleanup } from 'value/cleanup';
import { useContext, useMutableValue, useValue } from 'value/hooks';

declare module '@table-q/units' {
  interface Value<Signed, U, Decimals> {
    add(value: Numeric | Value<SignedType<Signed>, U>): Value<Signed, U, Decimals>;
  }
}

export function add<Signed extends SignedParam, U extends UNIT, Decimals extends number>(
  this: Value<Signed, U, Decimals>,
  value: Numeric | Value<SignedType<Signed>, U>,
): Value<Signed, U, Decimals> {
  let param: Value<SignedType<Signed> | Signed, U, number>;
  const unit = useValue(this).unit;
  const decimals = useContext(this).decimals;
  if (!isString(value)) {
    if (this.kind() !== useContext(value).kind) {
      throw Errors.INVALID_TYPE('value', this.kind());
    }
    const signed = useContext(this).signed;
    const paramSigned = useContext(value).signed;
    if (!signed && paramSigned) {
      throw Errors.INVALID_CONVERSION('SIGNED', 'UNSIGNED');
    }
    param = value.scale(decimals);
  } else {
    param = unit.createValue(value);
  }
  const ret = this.clone();
  const r = useMutableValue(ret);
  const { numerator, denominator } = useValue(param);
  const old = r.denominator;

  r.denominator *= denominator;
  r.numerator = r.numerator * denominator + numerator * old;

  return cleanup(ret);
}

export function extend(proto: Value) {
  proto.add = function (value) {
    return add.apply(this, [value]);
  };
}
