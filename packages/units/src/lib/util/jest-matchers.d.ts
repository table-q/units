import type { Value } from '@table-q/units';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeUnit(expected: Value | string): R;
    }
  }
}
