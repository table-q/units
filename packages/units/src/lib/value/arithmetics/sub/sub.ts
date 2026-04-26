import type { SignedParam, SignedType, UNIT } from 'unit';
import { Errors } from 'util/errors';
import { isString, type Numeric } from 'util/helpers';
import type { Value } from 'value';
import { cleanup } from 'value/cleanup';
import { useContext, useMutableValue, useValue } from 'value/hooks';

declare module '@table-q/units' {
  interface Value<Signed, U, Decimals> {
    sub(value: Numeric | Value<SignedType<Signed>, U>): Value<Signed, U, Decimals>;
  }
}

export function sub<Signed extends SignedParam, U extends UNIT, Decimals extends number>(
  this: Value<Signed, U, Decimals>,
  value: Numeric | Value<SignedType<Signed>, U>,
): Value<Signed, U, Decimals> {
  let param = value as Value<Signed, U>;
  const unit = useValue(this).unit;
  const decimals = useContext(this).decimals;
  if (!isString(param)) {
    if (this.kind() !== useContext(param).kind) {
      throw Errors.INVALID_TYPE('value', this.kind());
    }
    const signed = useContext(this).signed;
    const paramSigned = useContext(param).signed;
    if (!signed && paramSigned) {
      throw Errors.INVALID_CONVERSION('SIGNED', 'UNSIGNED');
    }
    param = param.scale(decimals);
  } else {
    param = unit.createValue(param) as Value<Signed, U>;
  }
  const ret = this.clone();
  const r = useMutableValue(ret);
  const { signed } = useContext(ret);
  const { numerator, denominator } = useValue(param);
  const old = r.denominator;
  const a = r.numerator * denominator;
  const b = numerator * old;
  if (!signed && a < b) {
    throw Errors.UNDERFLOW();
  }
  r.numerator = a - b;
  r.denominator *= denominator;
  return cleanup(ret);
}

export function extend(proto: Value) {
  proto.sub = function (value) {
    return sub.apply(this, [value]);
  };
}
