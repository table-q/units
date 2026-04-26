import { DATA_SYMBOL as _d, type Decimal } from 'util/helpers';
import { randomDecimal, randomInt } from 'util/test-random';
import { GBP, PRECISE_GBP, UNSIGNED_GBP } from 'value/arithmetics/testTypes';
import { useMutableValue } from 'value/hooks';

describe('clone()', () => {
  it('should return a new instance with the same value', () => {
    const val = randomDecimal(1, 99, 2);
    const a = GBP(val);
    const b = a.clone();
    expect(b).toBeUnit(val);
    expect(b).not.toBe(a);
  });

  it('should preserve numerator and denominator on cloned instance', () => {
    const a = GBP('1/3');
    const b = a.clone();
    expect(b[_d].numerator).toBe(a[_d].numerator);
    expect(b[_d].denominator).toBe(a[_d].denominator);
  });

  it('should share the same unit on cloned instance', () => {
    const a = GBP('1');
    const b = a.clone();
    expect(b[_d].unit).toBe(a[_d].unit);
  });

  it('should not affect original when mutating clone', () => {
    const n = randomInt(1, 100);
    const a = GBP(n);
    const b = a.clone();
    useMutableValue(b).numerator = 999n;
    expect(a[_d].numerator).toBe(BigInt(n) * 100n);
    expect(b[_d].numerator).toBe(999n);
  });

  it('should preserve kind on clone', () => {
    const a = GBP('1');
    expect(a.clone().kind()).toBe('GBP');
  });

  it('should preserve decimals on clone', () => {
    const a = PRECISE_GBP('1');
    expect(a.clone().decimals()).toBe(4);
  });

  it('should preserve signedness on clone', () => {
    const a = UNSIGNED_GBP('1');
    expect(a.clone().isSigned()).toBe(false);
  });

  it('should stay negative when cloning a negative value', () => {
    const val = `-${randomDecimal(1, 99, 2)}` as Decimal;
    const a = GBP(val);
    const b = a.clone();
    expect(b).toBeUnit(val);
    expect(b.isNegative()).toBe(true);
  });

  it('should clone zero correctly', () => {
    const a = GBP('0');
    const b = a.clone();
    expect(b).toBeUnit('0.00');
  });

  it('should preserve non-reduced form when cloning a fraction', () => {
    const a = GBP('2/6');
    const b = a.clone();
    expect(b[_d].numerator).toBe(a[_d].numerator);
    expect(b[_d].denominator).toBe(a[_d].denominator);
  });
});
