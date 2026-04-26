import { Errors } from 'util/errors';
import type { Infinity, Numeric } from 'util/helpers';
import { DATA_SYMBOL as _d, isBitSize, isPositiveInteger, isPrecision } from 'util/helpers';
import { createValueInstance, type Value } from 'value';
import type { ValueFormatParts } from 'value/format/format';
import type { ROUNDING_MODE } from 'value/rounding/rounding';

export type UNIT = Uppercase<string>;

export type SignedParam = 'SIGNED' | 'UNSIGNED';

export type SignedType<Signed extends SignedParam = SignedParam> = Signed extends 'SIGNED'
  ? SignedParam
  : 'UNSIGNED';

export type SignedTypeInverse<Signed extends SignedParam = SignedParam> = Signed extends 'SIGNED'
  ? 'SIGNED'
  : SignedParam;

export type SignedString<Signed extends boolean = true | false> = Signed extends true
  ? 'SIGNED'
  : Signed extends false
    ? 'UNSIGNED'
    : never;

export type SignedBool<Signed extends SignedString = SignedParam> = Signed extends 'SIGNED'
  ? true
  : Signed extends 'UNSIGNED'
    ? false
    : never;

export type RoundingConstraint<
  Signed extends SignedParam = SignedParam,
  U extends UNIT = UNIT,
  Decimals extends number = number,
> = (value: Value<Signed, U, Decimals>) => void;

type Context<
  Signed extends boolean = boolean,
  U extends UNIT = UNIT,
  Decimals extends number = number,
> = {
  kind: U;
  signed: Signed;
  decimals: Decimals;
  precision: number | Infinity;
  bitsize: number;
  formatter?: (parts: ValueFormatParts) => string;
  constraints?: readonly RoundingConstraint<SignedString<Signed>, U, Decimals>[];
};

export type FullContext<
  Signed extends SignedParam = SignedParam,
  U extends UNIT = UNIT,
  Decimals extends number = number,
> = Readonly<Omit<Context<SignedBool<Signed>, U, Decimals>, 'constraints'>> & {
  readonly minBigInt: bigint | number;
  readonly maxBigInt: bigint | number;
  readonly constraints?: readonly RoundingConstraint<Signed, U, Decimals>[];
};

export interface Unit<
  Signed extends SignedParam = SignedParam,
  U extends UNIT = UNIT,
  Decimals extends number = number,
> {
  readonly [_d]: FullContext<Signed, U, Decimals>;
  createValue(
    value: string | number | bigint | Value<Signed, U, Decimals>,
    bigInt?: boolean,
  ): Value<Signed, U, Decimals>;
  fromBigInt(value: bigint | string | number): Value<SignedParam, U>;
  clone<CloneSigned extends SignedParam, CloneU extends UNIT, CloneDecimals extends number>(
    props?: Partial<Context<SignedBool<CloneSigned>, CloneU, CloneDecimals>>,
  ): Unit<CloneSigned, CloneU, CloneDecimals>;
}

function createUnitInstance<Signed extends SignedParam, U extends UNIT, Decimals extends number>(
  props: Context,
): Unit<Signed, U, Decimals> {
  if (typeof props?.kind !== 'string') {
    throw Errors.INVALID_TYPE('kind', 'string');
  }
  const { decimals, precision, bitsize, signed } = props;
  if (!isPositiveInteger(decimals)) {
    throw Errors.INVALID_TYPE('decimals', 'positive integer');
  }
  if (!isPrecision(precision, decimals)) {
    throw Errors.NOT_PRECISION('precision', 'decimals', precision, decimals);
  }
  if (!isBitSize(bitsize)) {
    throw Errors.NOT_BITSIZE('bitsize', bitsize);
  }
  const minBigInt: bigint | number = !signed
    ? 0n
    : Number.isFinite(bitsize)
      ? -(2n ** BigInt(bitsize - 1))
      : Number.NEGATIVE_INFINITY;
  const maxBigInt: bigint | number = !Number.isFinite(bitsize)
    ? Number.POSITIVE_INFINITY
    : signed
      ? 2n ** BigInt(bitsize - 1) - 1n
      : 2n ** BigInt(bitsize) - 1n;
  const contextData = Object.freeze({
    ...props,
    minBigInt,
    maxBigInt,
  }) as FullContext<Signed, U, Decimals>;

  const unit: Unit<Signed, U, Decimals> = {
    [_d]: contextData,
    createValue(value, bigInt = false) {
      return createValueInstance(value as string, unit, bigInt);
    },
    fromBigInt(value) {
      if (typeof value === 'number' && Math.abs(value) > Number.MAX_SAFE_INTEGER) {
        throw Errors.INVALID_TYPE('value', 'safe integer');
      }
      return createValueInstance(String(value), unit, true);
    },
    clone(cloneProps = {}) {
      return createUnitInstance({
        ...(unit[_d] as unknown as Context),
        ...cloneProps,
      });
    },
  };

  return unit;
}

function createUnit<
  Signed extends boolean = boolean,
  U extends UNIT = UNIT,
  Decimals extends number = number,
>(props: Context<Signed, U, Decimals>) {
  const unit = createUnitInstance<SignedString<Signed>, U, Decimals>(props);
  const ret = (
    value: Numeric | Value<SignedType<SignedString<Signed>>, U>,
    roundingMode?: ROUNDING_MODE,
    roundingDecimalPlaces = 0,
  ): Value<SignedString<Signed>, U, Decimals> => {
    type Param = string | Value<SignedString<Signed>, U, Decimals>;
    type ReturnType = Value<SignedString<Signed>, U, Decimals>;
    if (roundingMode) {
      return unit
        .createValue(value as Param)
        .round(roundingMode, roundingDecimalPlaces) as ReturnType;
    }
    return unit.createValue(value as Param).normalize() as ReturnType;
  };

  Object.defineProperty(ret, 'name', {
    writable: false,
    enumerable: false,
    value: props.kind,
  });
  Object.defineProperty(ret, 'unit', {
    writable: false,
    enumerable: false,
    value: unit,
  });
  Object.defineProperty(ret, 'fromBigInt', {
    writable: false,
    enumerable: true,
    value: (value: bigint | string | number) => unit.fromBigInt(value),
  });
  Object.defineProperty(ret, 'kind', {
    writable: false,
    enumerable: true,
    value: props.kind,
  });
  Object.defineProperty(ret, 'clone', {
    writable: false,
    enumerable: true,
    value: (_props: Record<string, unknown>) =>
      createUnit({
        ...props,
        ..._props,
      }),
  });

  Object.defineProperty(ret, 'minValue', {
    enumerable: true,
    get() {
      const { minBigInt } = unit[_d];
      if (typeof minBigInt !== 'bigint') {
        throw Errors.UNDERFLOW();
      }
      return unit.fromBigInt(minBigInt);
    },
  });
  Object.defineProperty(ret, 'maxValue', {
    enumerable: true,
    get() {
      const { maxBigInt } = unit[_d];
      if (typeof maxBigInt !== 'bigint') {
        throw Errors.OVERFLOW();
      }
      return unit.fromBigInt(maxBigInt);
    },
  });

  Object.defineProperty(ret, Symbol.hasInstance, {
    writable: false,
    enumerable: false,
    value: (instance: Value) => instance?.[_d]?.unit === unit,
  });
  Object.defineProperty(ret, Symbol.toStringTag, {
    writable: false,
    enumerable: false,
    value: `Constructor<${props.kind}>`,
  });
  type ValueConstructor<_Signed extends SignedParam, _U extends UNIT, _Decimals extends number> = ((
    value: Numeric | Value<SignedType<_Signed>, _U>,
    roundingMode?: ROUNDING_MODE,
    roundingDecimalPlaces?: number,
  ) => Value<_Signed, _U, _Decimals>) & {
    kind: _U;
    unit: Unit<_Signed, _U, _Decimals>;
    fromBigInt: (value: bigint | string | number) => Value<_Signed, _U, _Decimals>;
    readonly minValue: Value<_Signed, _U, _Decimals>;
    readonly maxValue: Value<_Signed, _U, _Decimals>;
    clone<
      ExtendSigned extends boolean = SignedBool<_Signed>,
      ExtendU extends UNIT = _U,
      ExtendDecimals extends number = _Decimals,
    >(
      props: Partial<Context<ExtendSigned, ExtendU, ExtendDecimals>>,
    ): ValueConstructor<SignedString<ExtendSigned>, ExtendU, ExtendDecimals>;
  };
  return ret as ValueConstructor<SignedString<Signed>, U, Decimals>;
}

export const SCALAR = createUnit({
  kind: 'SCALAR',
  bitsize: Number.POSITIVE_INFINITY,
  decimals: 0,
  precision: Number.POSITIVE_INFINITY,
  signed: true,
});
