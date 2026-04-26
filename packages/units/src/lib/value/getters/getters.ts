import type { SignedParam, UNIT } from 'unit';
import type { Value } from 'value';
import { useContext, useValue } from 'value/hooks';

declare module '@table-q/units' {
  interface Value<Signed, U, Decimals> {
    kind(): U;
    isInteger(): boolean;
    isNegative(): boolean;
    isSigned(): boolean;
    decimals(): number;
    precision(): number;
    bitsize(): number;
  }
}

export function isInteger(this: Value): boolean {
  const { numerator, denominator } = useValue(this);
  const { decimals } = useContext(this);
  return numerator % (denominator * 10n ** BigInt(decimals)) === 0n;
}

export function isNegative(this: Value): boolean {
  const { numerator } = useValue(this);
  return numerator < 0n;
}

export function isSigned(this: Value): boolean {
  const { signed } = useContext(this);
  return signed;
}

export function kind<U extends UNIT>(this: Value<SignedParam, U>): U {
  const { kind } = useContext(this);
  return kind as U;
}

export function decimals(this: Value): number {
  const { decimals } = useContext(this);
  return decimals;
}

export function precision(this: Value): number {
  const { precision } = useContext(this);
  return precision as number;
}

export function bitsize(this: Value): number {
  const { bitsize } = useContext(this);
  return bitsize;
}

export function extend(proto: Value) {
  proto.kind = function () {
    return kind.apply(this);
  };
  proto.isInteger = isInteger;
  proto.isNegative = isNegative;
  proto.isSigned = isSigned;
  proto.decimals = decimals;
  proto.precision = precision;
  proto.bitsize = bitsize;
}
