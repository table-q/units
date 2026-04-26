import { Errors } from 'util/errors';
import { GBP, UNSIGNED_GBP } from 'value/arithmetics/testTypes';
import { useMutableValue, useValue } from 'value/hooks';

describe('normalize', () => {
  it('should reduce by GCD', () => {
    const v = GBP('1');
    const m = useMutableValue(v);
    m.numerator = 10n;
    m.denominator = 4n;
    v.normalize();
    expect(useValue(v).numerator).toBe(5n);
    expect(useValue(v).denominator).toBe(2n);
  });

  it('should leave an already-reduced fraction unchanged', () => {
    const v = GBP('1');
    const m = useMutableValue(v);
    m.numerator = 3n;
    m.denominator = 7n;
    v.normalize();
    expect(useValue(v).numerator).toBe(3n);
    expect(useValue(v).denominator).toBe(7n);
  });

  it('should reduce large common factors', () => {
    const v = GBP('1');
    const m = useMutableValue(v);
    m.numerator = 1000000n;
    m.denominator = 500000n;
    v.normalize();
    expect(useValue(v).numerator).toBe(2n);
    expect(useValue(v).denominator).toBe(1n);
  });

  it('should normalize sign via cleanup', () => {
    const v = GBP('1');
    const m = useMutableValue(v);
    m.numerator = 6n;
    m.denominator = -4n;
    v.normalize();
    expect(useValue(v).numerator).toBe(-3n);
    expect(useValue(v).denominator).toBe(2n);
  });

  it('should throw DIVISION_BY_ZERO via cleanup when denominator is 0', () => {
    const v = GBP('1');
    useMutableValue(v).denominator = 0n;
    expect(() => v.normalize()).toThrow(Errors.DIVISION_BY_ZERO());
  });

  it('should throw INVALID_CONVERSION for negative unsigned via cleanup', () => {
    const v = UNSIGNED_GBP('1');
    const m = useMutableValue(v);
    m.numerator = -6n;
    m.denominator = 4n;
    expect(() => v.normalize()).toThrow(Errors.INVALID_CONVERSION('SIGNED', 'UNSIGNED'));
  });

  it('should return the same value reference', () => {
    const v = GBP('1');
    const m = useMutableValue(v);
    m.numerator = 10n;
    m.denominator = 4n;
    expect(v.normalize()).toBe(v);
  });

  it('should reduce denominator when numerator is zero', () => {
    const v = GBP('1');
    const m = useMutableValue(v);
    m.numerator = 0n;
    m.denominator = 100n;
    v.normalize();
    expect(useValue(v).numerator).toBe(0n);
    expect(useValue(v).denominator).toBe(1n);
  });
});
