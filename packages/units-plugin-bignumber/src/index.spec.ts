import { SCALAR } from '@table-q/units';
import './index';

const GBP = SCALAR.clone({ kind: 'GBP', decimals: 2, signed: true });

describe('bignumber()', () => {
  test('multiply via BigNumber', () => {
    expect(GBP('1').bignumber((n) => n.multipliedBy(2))).toBeUnit('2.00');
  });

  test('sqrt via BigNumber', () => {
    expect(GBP('4').bignumber((n) => n.sqrt())).toBeUnit('2.00');
  });

  test('power via BigNumber', () => {
    expect(GBP('3').bignumber((n) => n.pow(2))).toBeUnit('9.00');
  });

  test('preserves unit and decimals', () => {
    const result = GBP('10').bignumber((n) => n.dividedBy(3));
    expect(result.kind()).toBe('GBP');
    expect(result.decimals()).toBe(2);
  });

  test('chains with Value ops', () => {
    expect(
      GBP('4')
        .bignumber((n) => n.sqrt())
        .add('1'),
    ).toBeUnit('3.00');
  });

  test('accepts BigNumber config', () => {
    const result = GBP('10').bignumber((n) => n.dividedBy(3), {
      DECIMAL_PLACES: 4,
      ROUNDING_MODE: 1,
    });
    expect(result).toBeUnit('3.3333');
  });
});
