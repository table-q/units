import type { SignedParam, UNIT, Unit } from 'unit';
import { Errors } from 'util/errors';
import { DATA_SYMBOL as _d, isString } from 'util/helpers';
import type { MutableValueData, Value } from 'value';
import { cleanup } from 'value/cleanup';
import { useMutableValue } from 'value/hooks';

function initData<Signed extends SignedParam, U extends UNIT, Decimals extends number>(
  unit: Unit<Signed, U, Decimals>,
): MutableValueData<Signed, U, Decimals> {
  return { numerator: 0n, denominator: 1n, unit };
}

function fromBigIntString(value: string): [bigint, bigint] {
  try {
    return [BigInt(value), 1n];
  } catch {
    throw Errors.INVALID_TYPE('value', 'bigint');
  }
}

function fromValue<Signed extends SignedParam, U extends UNIT, Decimals extends number>(
  that: Value<Signed, U, Decimals>,
  value: Value<Signed, U>,
): [bigint, bigint] {
  const isKind = that.kind() === value?.[_d]?.unit?.[_d].kind;
  if (!isKind) {
    throw Errors.INVALID_TYPE('value', that.kind());
  }
  if (value.isSigned() && !that.isSigned()) {
    throw Errors.INVALID_CONVERSION('SIGNED', 'UNSIGNED');
  }
  const decimals = value[_d].unit[_d].decimals;
  let _value = value as Value<Signed, U>;
  if (decimals !== that.decimals()) {
    _value = _value.scale(that.decimals());
  }
  return [_value[_d].numerator, _value[_d].denominator];
}

function parseRationalPart(part: string): [bigint, bigint] {
  if (part.includes('.')) {
    const dotIndex = part.indexOf('.');
    const fractionalDigits = part.length - dotIndex - 1;
    const withoutDot = part.slice(0, dotIndex) + part.slice(dotIndex + 1);
    return [BigInt(withoutDot), 10n ** BigInt(fractionalDigits)];
  }
  return [BigInt(part), 1n];
}

function parseFraction(value: string, unitDecimals: number): [bigint, bigint] {
  let [p1, p2, ...rest] = value.split('/');
  if (rest.length) {
    throw Errors.INVALID_TYPE('value', 'fraction');
  }
  const decimals = 10n ** BigInt(unitDecimals);
  let p1Negative = false;
  let p2Negative = false;
  if (p1.startsWith('-')) {
    p1 = p1.slice(1);
    p1Negative = true;
  }
  if (p2.startsWith('-')) {
    p2 = p2.slice(1);
    p2Negative = true;
  }
  try {
    const [p1Num, p1Den] = parseRationalPart(p1);
    const [p2Num, p2Den] = parseRationalPart(p2);
    let numerator = p1Num * p2Den * decimals * 10n ** BigInt(unitDecimals);
    let denominator = p2Num * p1Den * decimals;
    if (p1Negative) {
      numerator *= -1n;
    }
    if (p2Negative) {
      denominator *= -1n;
    }
    return [numerator, denominator];
  } catch {
    throw Errors.INVALID_TYPE('value', 'fraction');
  }
}

function parseDecimal(value: string, unitDecimals: number): [bigint, bigint] {
  let val = value.trim();
  let negative = '';
  if (val.charAt(0) === '-') {
    val = val.substring(1);
    negative = '-';
  }
  const [p1, p2, ...rest] = val.split('.');
  if (rest.length) {
    throw Errors.INVALID_TYPE('value', 'decimal');
  }
  try {
    const numerator = BigInt(`${negative}${p1}${p2}`) * 10n ** BigInt(unitDecimals);
    const denominator = 10n ** BigInt(val.length - val.indexOf('.') - 1);
    return [numerator, denominator];
  } catch {
    throw Errors.INVALID_TYPE('value', 'decimal');
  }
}

function parseInteger(value: string, unitDecimals: number): [bigint, bigint] {
  let trimmed = value.trim();
  let negative = false;
  if (trimmed.startsWith('-')) {
    trimmed = trimmed.slice(1);
    negative = true;
  }
  try {
    let numerator = BigInt(trimmed) * 10n ** BigInt(unitDecimals);
    if (negative) {
      numerator *= -1n;
    }
    return [numerator, 1n];
  } catch {
    throw Errors.INVALID_TYPE('value', 'decimal');
  }
}

function parseString(value: string, unitDecimals: number): [bigint, bigint] {
  if (value.includes('/')) return parseFraction(value, unitDecimals);
  if (value.includes('.')) return parseDecimal(value, unitDecimals);
  return parseInteger(value, unitDecimals);
}

export function construct<Signed extends SignedParam, U extends UNIT, Decimals extends number>(
  this: Value<Signed, U, Decimals>,
  value: string | Value<Signed, U>,
  unit: Unit<Signed, U, Decimals>,
  isBigInt: boolean,
): Value<Signed, U, Decimals> {
  this[_d] = initData(unit);
  const data = useMutableValue(this);
  if (isBigInt) {
    [data.numerator, data.denominator] = fromBigIntString(value as string);
  } else if (!isString(value)) {
    [data.numerator, data.denominator] = fromValue(this, value);
  } else {
    [data.numerator, data.denominator] = parseString(value, this.decimals());
  }
  return cleanup(this);
}
