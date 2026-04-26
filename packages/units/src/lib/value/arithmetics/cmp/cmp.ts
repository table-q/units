import type { UNIT } from 'unit';
import { SCALAR, type SignedParam } from 'unit';
import { Errors } from 'util/errors';
import { isString, type Numeric } from 'util/helpers';
import type { Value } from 'value';
import { useContext, useValue } from 'value/hooks';

declare module '@table-q/units' {
  interface Value<Signed, U, Decimals> {
    cmp(value: Numeric | Value<SignedParam, U>): number;
    eq(value: Numeric | Value<SignedParam, U>): boolean;
    gt(value: Numeric | Value<SignedParam, U>): boolean;
    gte(value: Numeric | Value<SignedParam, U>): boolean;
    lt(value: Numeric | Value<SignedParam, U>): boolean;
    lte(value: Numeric | Value<SignedParam, U>): boolean;
    neq(value: Numeric | Value<SignedParam, U>): boolean;
    min(value: Numeric | Value<SignedParam, U>): Value<Signed, U, Decimals>;
    max(value: Numeric | Value<SignedParam, U>): Value<Signed, U, Decimals>;
  }
}

export function cmp<Signed extends SignedParam, U extends UNIT, Decimals extends number>(
  this: Value<Signed, U, Decimals>,
  value: Numeric | Value<SignedParam, U>,
): 1 | 0 | -1 {
  const ctx = useContext(this);
  let param: Value;
  let multiplier = 1n;
  const thisValue = useValue(this);
  if (!isString(value)) {
    if (this.kind() !== useContext(value).kind) {
      throw Errors.INVALID_TYPE('value', this.kind());
    }
    param = value.scale(ctx.decimals);
  } else {
    param = SCALAR(value);
    multiplier = 10n ** BigInt(ctx.decimals);
  }
  const { numerator, denominator } = useValue(param);
  const thisNumerator = thisValue.numerator * denominator;
  const paramNumerator = numerator * thisValue.denominator * multiplier;
  if (thisNumerator > paramNumerator) {
    return 1;
  }
  if (thisNumerator < paramNumerator) {
    return -1;
  }
  return 0;
}

export function gt<Signed extends SignedParam, U extends UNIT, Decimals extends number>(
  this: Value<Signed, U, Decimals>,
  value: Numeric | Value<SignedParam, U>,
): boolean {
  return this.cmp(value) > 0;
}

export function gte<Signed extends SignedParam, U extends UNIT, Decimals extends number>(
  this: Value<Signed, U, Decimals>,
  value: Numeric | Value<SignedParam, U>,
): boolean {
  return this.cmp(value) >= 0;
}

export function lt<Signed extends SignedParam, U extends UNIT, Decimals extends number>(
  this: Value<Signed, U, Decimals>,
  value: Numeric | Value<SignedParam, U>,
): boolean {
  return this.cmp(value) < 0;
}

export function lte<Signed extends SignedParam, U extends UNIT, Decimals extends number>(
  this: Value<Signed, U, Decimals>,
  value: Numeric | Value<SignedParam, U>,
): boolean {
  return this.cmp(value) <= 0;
}

export function eq<Signed extends SignedParam, U extends UNIT, Decimals extends number>(
  this: Value<Signed, U, Decimals>,
  value: Numeric | Value<SignedParam, U>,
): boolean {
  return this.cmp(value) === 0;
}

export function neq<Signed extends SignedParam, U extends UNIT, Decimals extends number>(
  this: Value<Signed, U, Decimals>,
  value: Numeric | Value<SignedParam, U>,
): boolean {
  return this.cmp(value) !== 0;
}

export function min<Signed extends SignedParam, U extends UNIT, Decimals extends number>(
  this: Value<Signed, U, Decimals>,
  value: Numeric | Value<SignedParam, U>,
): Value<Signed, U, Decimals> {
  if (this.lte(value)) return this.clone();
  if (isString(value)) return useValue(this).unit.createValue(value);
  return value.scale(useContext(this).decimals) as Value<Signed, U, Decimals>;
}

export function max<Signed extends SignedParam, U extends UNIT, Decimals extends number>(
  this: Value<Signed, U, Decimals>,
  value: Numeric | Value<SignedParam, U>,
): Value<Signed, U, Decimals> {
  if (this.gte(value)) return this.clone();
  if (isString(value)) return useValue(this).unit.createValue(value);
  return value.scale(useContext(this).decimals) as Value<Signed, U, Decimals>;
}

export function extend(proto: Value) {
  proto.cmp = function (value) {
    return cmp.apply(this, [value]);
  };
  proto.eq = function (value) {
    return eq.apply(this, [value]);
  };
  proto.gt = function (value) {
    return gt.apply(this, [value]);
  };
  proto.gte = function (value) {
    return gte.apply(this, [value]);
  };
  proto.lt = function (value) {
    return lt.apply(this, [value]);
  };
  proto.lte = function (value) {
    return lte.apply(this, [value]);
  };
  proto.neq = function (value) {
    return neq.apply(this, [value]);
  };
  proto.min = function (value) {
    return min.apply(this, [value]);
  };
  proto.max = function (value) {
    return max.apply(this, [value]);
  };
}
