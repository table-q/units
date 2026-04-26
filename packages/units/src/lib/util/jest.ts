import { DATA_SYMBOL } from 'util/helpers';
import type { Value } from 'value';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeUnit(expected: Value | string): R;
    }
  }
}

const _inspect = Symbol.for('nodejs.util.inspect.custom');

// biome-ignore lint/suspicious/noExplicitAny: intentional
export function toBeUnit(this: any, a: Value, b: string | Value) {
  const inspect =
    // istanbul ignore next
    // biome-ignore lint/suspicious/noExplicitAny: intentional
    (value: any) => value?.[_inspect]?.() ?? value;
  let bValue: Value | undefined = b as Value;
  let pass = false;
  try {
    bValue = a[DATA_SYMBOL].unit.createValue(b);
    pass = a.eq(bValue);
  } catch {
    // ignore
  }
  return {
    message:
      // istanbul ignore next
      () =>
        `Expected: ${this.utils.printExpected(
          inspect(bValue) ?? bValue,
        )}\nReceived: ${this.utils.printReceived(inspect(a))}`,
    pass,
  };
}
