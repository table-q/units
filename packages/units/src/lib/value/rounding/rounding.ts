import type { SignedParam, UNIT } from 'unit';
import { Errors } from 'util/errors';
import { isPositiveInteger } from 'util/helpers';
import type { Value } from 'value';
import { cleanup } from 'value/cleanup';
import { useContext, useMutableValue } from 'value/hooks';

export const RoundingMode = {
  UP: 'ROUND_UP',
  DOWN: 'ROUND_DOWN',
  CEIL: 'ROUND_CEIL',
  FLOOR: 'ROUND_FLOOR',
  HALF_UP: 'ROUND_HALF_UP',
  HALF_DOWN: 'ROUND_HALF_DOWN',
  HALF_EVEN: 'ROUND_HALF_EVEN',
  HALF_CEIL: 'ROUND_HALF_CEIL',
  HALF_FLOOR: 'ROUND_HALF_FLOOR',
  THROW: 'ROUND_THROW',
} as const;

const RoundingModeValues = Object.values(RoundingMode);

const roundingModeMap = RoundingModeValues.reduce(
  (prev, act) => {
    prev[act] = act;
    return prev;
  },
  {} as Record<ROUNDING_MODE, string>,
);

export type ROUNDING_MODE = `${(typeof RoundingMode)[keyof typeof RoundingMode]}` | symbol;

declare module '@table-q/units' {
  interface Value<Signed, U, Decimals> {
    round(roundingMode: ROUNDING_MODE, decimalPlaces?: number): Value<Signed, U, Decimals>;
    roundToInt(roundingMode: ROUNDING_MODE): Value<Signed, U, Decimals>;
  }
}

function rounding(numerator: bigint, denominator: bigint, roundingMode: ROUNDING_MODE) {
  if (!roundingModeMap[roundingMode]) {
    throw Errors.UNSUPPORTED_ROUNDING_MODE(roundingMode as string);
  }

  if (roundingMode === RoundingMode.THROW && denominator !== 1n) {
    throw Errors.IMPRECISE_CONVERSION();
  }

  if (roundingMode === RoundingMode.DOWN) {
    return numerator / denominator;
  }

  const sign = numerator > 0n ? 1n : -1n;
  const modTimes2 = (numerator % denominator) * sign * 2n;

  if (modTimes2 === 0n) {
    return numerator / denominator;
  }

  if (roundingMode === RoundingMode.FLOOR) {
    if (sign < 0n) {
      numerator += denominator * sign;
    }
    return numerator / denominator;
  }

  if (roundingMode === RoundingMode.UP) {
    numerator += denominator * sign;
    return numerator / denominator;
  }

  if (roundingMode === RoundingMode.CEIL) {
    if (sign > 0n) {
      numerator += denominator * sign;
    }
    return numerator / denominator;
  }

  if (roundingMode === RoundingMode.HALF_DOWN) {
    if (modTimes2 > denominator) {
      numerator += denominator * sign;
    }
    return numerator / denominator;
  }

  if (roundingMode === RoundingMode.HALF_FLOOR) {
    if ((sign > 0n && modTimes2 > denominator) || (sign < 0n && modTimes2 >= denominator)) {
      numerator += denominator * sign;
    }
    return numerator / denominator;
  }

  if (roundingMode === RoundingMode.HALF_UP) {
    if (modTimes2 >= denominator) {
      numerator += denominator * sign;
    }
    return numerator / denominator;
  }

  if (roundingMode === RoundingMode.HALF_CEIL) {
    if ((sign > 0n && modTimes2 >= denominator) || (sign < 0n && modTimes2 > denominator)) {
      numerator += denominator * sign;
    }
    return numerator / denominator;
  }

  // istanbul ignore else
  if (roundingMode === RoundingMode.HALF_EVEN) {
    const even = (numerator / denominator) % 2n === 0n;
    if ((modTimes2 === denominator && !even) || modTimes2 > denominator) {
      numerator += denominator * sign;
    }
    return numerator / denominator;
  }

  // istanbul ignore next
  return numerator / denominator;
}

export function round<Signed extends SignedParam, U extends UNIT, Decimals extends number>(
  this: Value<Signed, U, Decimals>,
  roundingMode: ROUNDING_MODE,
  roundingDecimalPlaces = 0,
): Value<Signed, U, Decimals> {
  if (!isPositiveInteger(roundingDecimalPlaces)) {
    throw Errors.INVALID_TYPE('roundingDecimalPlaces', 'positive integer');
  }
  const { maxBigInt, minBigInt, precision } = useContext(this);
  if (Number.isFinite(precision) && roundingDecimalPlaces > Number(precision)) {
    throw Errors.INVALID_TYPE('roundingDecimalPlaces', `<= ${precision} (precision)`);
  }
  const ret = this.clone();
  ret.normalize();
  if (roundingDecimalPlaces !== 0) {
    const multiplier = 10n ** BigInt(roundingDecimalPlaces);
    return ret.div(`${multiplier}`).round(roundingMode).mul(`${multiplier}`);
  }

  const value = useMutableValue(ret);
  value.numerator = rounding(value.numerator, value.denominator, roundingMode);
  value.denominator = 1n;
  let numStr = String(value.numerator);
  if (numStr.charAt(0) === '-') {
    numStr = numStr.slice(1);
  }
  if (numStr.length > Number(precision)) {
    if (value.numerator < 0) {
      throw Errors.UNDERFLOW();
    }
    throw Errors.OVERFLOW();
  }
  if (value.numerator > maxBigInt) {
    throw Errors.OVERFLOW();
  }
  if (value.numerator < minBigInt) {
    throw Errors.UNDERFLOW();
  }
  const result = cleanup(ret);
  const { constraints } = useContext(this);
  if (constraints) {
    for (const constraint of constraints) {
      constraint(result);
    }
  }
  return result;
}

export function roundToInt<Signed extends SignedParam, U extends UNIT, Decimals extends number>(
  this: Value<Signed, U, Decimals>,
  roundingMode: ROUNDING_MODE,
): Value<Signed, U, Decimals> {
  const { decimals } = useContext(this);
  return this.round(roundingMode, decimals);
}

export function extend(proto: Value) {
  proto.round = round;
  proto.roundToInt = roundToInt;
}
