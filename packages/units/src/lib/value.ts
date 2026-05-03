import type { SignedParam, UNIT, Unit } from 'unit';
import { DATA_SYMBOL as _d } from 'util/helpers';
import { extend as extendAbs } from 'value/arithmetics/abs/abs';
import { extend as extendAdd } from 'value/arithmetics/add/add';
import { extend as extendCmp } from 'value/arithmetics/cmp/cmp';
import { extend as extendConvert } from 'value/arithmetics/convert/convert';
import { extend as extendDistribute } from 'value/arithmetics/distribute/distribute';
import { extend as extendDiv } from 'value/arithmetics/div/div';
import { extend as extendDivmod } from 'value/arithmetics/divmod/divmod';
import { extend as extendMod } from 'value/arithmetics/mod/mod';
import { extend as extendMul } from 'value/arithmetics/mul/mul';
import { extend as extendPercent } from 'value/arithmetics/percent/percent';
import { extend as extendPow } from 'value/arithmetics/pow/pow';
import { extend as extendScale } from 'value/arithmetics/scale/scale';
import { extend as extendSub } from 'value/arithmetics/sub/sub';
import { extend as extendClone } from 'value/clone';
import { construct } from 'value/constructor';
import { extend as extendFormat } from 'value/format/format';
import { extend as extendGetters } from 'value/getters/getters';
import { extend as extendNormalize } from 'value/normalize';
import { extend as extendObject } from 'value/object/object';
import { extend as extendRounding } from 'value/rounding/rounding';
import { extend as extendToScalar } from 'value/toScalar';

export type Scalar = Value<'SIGNED', 'SCALAR', 0>;

export type ValueData<
  Signed extends SignedParam = SignedParam,
  U extends UNIT = UNIT,
  Decimals extends number = number,
> = {
  readonly numerator: bigint;
  readonly denominator: bigint;
  readonly unit: Unit<Signed, U, Decimals>;
};

export type MutableValueData<
  Signed extends SignedParam = SignedParam,
  U extends UNIT = UNIT,
  Decimals extends number = number,
> = {
  numerator: bigint;
  denominator: bigint;
  unit: Unit<Signed, U, Decimals>;
};

export interface Value<
  Signed extends SignedParam = SignedParam,
  U extends UNIT = UNIT,
  Decimals extends number = number,
> {
  [_d]: ValueData<Signed, U, Decimals>;
}

const proto = {} as Value;

export function extend(fn: (proto: Value) => void) {
  fn(proto);
}

export function createValueInstance<
  Signed extends SignedParam,
  U extends UNIT,
  Decimals extends number,
>(
  value: string | bigint | Value<Signed, U>,
  unit: Unit<Signed, U, Decimals>,
  isBigInt: boolean,
): Value<Signed, U, Decimals> {
  const instance: Value<Signed, U, Decimals> = Object.create(proto);
  construct.call(instance, value, unit, isBigInt);
  return instance;
}

extendClone(proto);
extendGetters(proto);
extendNormalize(proto);
extendRounding(proto);
extendFormat(proto);
extendObject(proto);
extendAdd(proto);
extendSub(proto);
extendAbs(proto);
extendMul(proto);
extendDiv(proto);
extendPercent(proto);
extendMod(proto);
extendDivmod(proto);
extendCmp(proto);
extendPow(proto);
extendScale(proto);
extendConvert(proto);
extendDistribute(proto);
extendToScalar(proto);
