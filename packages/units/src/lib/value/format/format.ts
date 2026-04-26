import type { Decimal, Fraction, Infinity } from 'util/helpers';
import type { Value } from 'value';
import { useContext, useMutableValue, useValue } from 'value/hooks';
import { type ROUNDING_MODE, RoundingMode } from 'value/rounding/rounding';

export type ValueFormatParts = {
  decimal: Decimal;
  bigint: bigint;
  decimals: number;
  precision: number | Infinity;
  bitsize: number;
  negative: boolean;
  integer: string;
  fraction: string;
  kind: Uppercase<string>;
};

declare module '@table-q/units' {
  interface Value<Signed, U, Decimals> {
    format(roundingMode?: ROUNDING_MODE, roundingDecimalPlaces?: number): string;
    formatToParts(roundingMode?: ROUNDING_MODE, roundingDecimalPlaces?: number): ValueFormatParts;
    toDecimal(roundingMode?: ROUNDING_MODE, roundingDecimalPlaces?: number): Decimal;
    toFraction(): Fraction;
    toBigInt(roundingMode?: ROUNDING_MODE, roundingDecimalPlaces?: number): string;
  }
}

export function toBigInt(
  this: Value,
  roundingMode: ROUNDING_MODE = RoundingMode.THROW,
  roundingDecimalPlaces = 0,
) {
  const { numerator, denominator } = useValue(this.round(roundingMode, roundingDecimalPlaces));
  const result = numerator / denominator;
  return String(result);
}

export function toFraction(this: Value): Fraction {
  const clone = this.clone();
  const m = useMutableValue(clone);
  const { decimals } = useContext(this);
  m.denominator *= 10n ** BigInt(decimals);
  clone.normalize();
  return `${m.numerator}/${m.denominator}`;
}

function _formatToParts(that: Value, roundingMode: ROUNDING_MODE, roundingDecimalPlaces: number) {
  const { numerator, denominator } = useValue(that.round(roundingMode, roundingDecimalPlaces));
  const { decimals, kind } = useContext(that);
  const negative = numerator < 0n;
  let div = String(numerator / denominator);
  if (negative) {
    div = div.slice(1);
  }
  const dec = decimals !== 0 ? decimals : -div.length;
  return {
    negative,
    integer: `${div.slice(0, -dec).padStart(1, '0')}`,
    fraction: decimals > 0 ? div.slice(-dec).padStart(dec, '0') : '',
    kind,
    numerator,
    denominator,
  };
}

function _decimalFromParts(parts: ReturnType<typeof _formatToParts>): Decimal {
  const prefix = parts.negative ? '-' : '';
  if (!parts.fraction) {
    return `${prefix}${parts.integer}` as Decimal;
  }
  return `${prefix}${[parts.integer, parts.fraction].join('.')}` as Decimal;
}

export function formatToParts(
  this: Value,
  roundingMode: ROUNDING_MODE = RoundingMode.THROW,
  roundingDecimalPlaces = 0,
): ValueFormatParts {
  const parts = _formatToParts(this, roundingMode, roundingDecimalPlaces);
  const { decimals, precision, bitsize } = useContext(this);
  return {
    negative: parts.negative,
    fraction: parts.fraction,
    integer: parts.integer,
    kind: parts.kind,
    decimal: _decimalFromParts(parts),
    bigint: parts.numerator / parts.denominator,
    decimals,
    precision,
    bitsize,
  };
}

export function toDecimal(
  this: Value,
  roundingMode: ROUNDING_MODE = RoundingMode.THROW,
  roundingDecimalPlaces = 0,
): Decimal {
  const parts = _formatToParts(this, roundingMode, roundingDecimalPlaces);
  return _decimalFromParts(parts);
}

export function format(
  this: Value,
  roundingMode: ROUNDING_MODE = RoundingMode.THROW,
  roundingDecimalPlaces = 0,
) {
  const { formatter } = useContext(this);
  if (!formatter) {
    return this.toDecimal(roundingMode, roundingDecimalPlaces);
  }
  return formatter(this.formatToParts(roundingMode, roundingDecimalPlaces));
}

export function extend(proto: Value) {
  proto.format = format;
  proto.formatToParts = formatToParts;
  proto.toDecimal = toDecimal;
  proto.toFraction = toFraction;
  proto.toBigInt = toBigInt;
}
