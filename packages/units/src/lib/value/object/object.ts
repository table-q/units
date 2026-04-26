import type { SignedParam, UNIT } from 'unit';
import { Errors } from 'util/errors';
import { isRepeatingDecimal } from 'util/helpers';
import type { Value } from 'value';
import { useContext, useValue } from 'value/hooks';

declare module '@table-q/units' {
  interface Value<Signed, U, Decimals> {
    valueOf(): never;
    toString(): string;
    toJSON(): string;
    [Symbol.toPrimitive](hint: string): never;
    readonly [Symbol.toStringTag]: U;
  }
}

export function toString(this: Value) {
  return this.toDecimal();
}

export function toJSON(this: Value) {
  return this.toString();
}

export function valueOf(this: Value) {
  throw Errors.INVALID_CONVERSION(useContext(this).kind, 'default');
}

export function toPrimitive(this: Value, hint: string) {
  throw Errors.INVALID_CONVERSION(useContext(this).kind, hint);
}

export function toStringTag<U extends UNIT>(this: Value<SignedParam, U>) {
  return useContext(this).kind;
}

export function inspect(this: Value) {
  const { denominator, numerator } = useValue(this.normalize());
  const { decimals } = useContext(this);
  const { kind } = useContext(this);
  const format = (negative: string, num: string, kind: string) => `${kind}(${negative}${num})`;
  if (isRepeatingDecimal(denominator)) {
    return format('', this.toFraction(), kind);
  }
  const fraction = [] as string[];
  const _denominator = denominator * 10n ** BigInt(decimals);
  let negative = false;
  let _numerator = numerator;
  if (_numerator < 0n) {
    _numerator *= -1n;
    negative = true;
  }
  const integer = _numerator / _denominator;
  let newMod = _numerator % _denominator;
  while (newMod !== 0n) {
    const newNumerator = newMod * 10n;
    newMod = newNumerator % _denominator;
    fraction.push(String(newNumerator / _denominator));
  }
  const fractionStr = fraction.join('').padEnd(decimals, '0');
  return format(
    negative ? '-' : '',
    `${String(integer)}${fractionStr.length ? `.${fractionStr}` : ''}`,
    kind,
  );
}

export function extend(proto: Value) {
  proto.valueOf = valueOf as () => never;
  proto.toString = toString;
  proto.toJSON = toJSON;
  proto[Symbol.toPrimitive] = toPrimitive as (hint: string) => never;

  Object.defineProperty(proto, Symbol.toStringTag, {
    get() {
      return toStringTag.apply(this);
    },
  });

  Object.defineProperty(proto, Symbol.for('nodejs.util.inspect.custom'), {
    value() {
      return inspect.apply(this);
    },
  });
}
