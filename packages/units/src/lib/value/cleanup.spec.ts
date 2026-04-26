import { Errors } from 'util/errors';
import { randomInt } from 'util/test-random';
import { GBP, UNSIGNED_GBP } from 'value/arithmetics/testTypes';
import { cleanup } from 'value/cleanup';
import { useMutableValue, useValue } from 'value/hooks';

describe('cleanup', () => {
  it('should throw DIVISION_BY_ZERO when denominator is 0', () => {
    const v = GBP('1');
    useMutableValue(v).denominator = 0n;
    expect(() => cleanup(v)).toThrow(Errors.DIVISION_BY_ZERO());
  });

  it('should keep positive numerator and positive denominator as-is', () => {
    const num = BigInt(randomInt(2, 100));
    const den = BigInt(randomInt(2, 100));
    const v = GBP('1');
    const m = useMutableValue(v);
    m.numerator = num;
    m.denominator = den;
    cleanup(v);
    expect(useValue(v).numerator).toBe(num);
    expect(useValue(v).denominator).toBe(den);
  });

  it('should keep negative numerator and positive denominator as-is', () => {
    const num = BigInt(randomInt(2, 100));
    const den = BigInt(randomInt(2, 100));
    const v = GBP('1');
    const m = useMutableValue(v);
    m.numerator = -num;
    m.denominator = den;
    cleanup(v);
    expect(useValue(v).numerator).toBe(-num);
    expect(useValue(v).denominator).toBe(den);
  });

  it('should normalize sign to numerator when numerator is positive and denominator is negative', () => {
    const num = BigInt(randomInt(2, 100));
    const den = BigInt(randomInt(2, 100));
    const v = GBP('1');
    const m = useMutableValue(v);
    m.numerator = num;
    m.denominator = -den;
    cleanup(v);
    expect(useValue(v).numerator).toBe(-num);
    expect(useValue(v).denominator).toBe(den);
  });

  it('should normalize both negative to both positive', () => {
    const num = BigInt(randomInt(2, 100));
    const den = BigInt(randomInt(2, 100));
    const v = GBP('1');
    const m = useMutableValue(v);
    m.numerator = -num;
    m.denominator = -den;
    cleanup(v);
    expect(useValue(v).numerator).toBe(num);
    expect(useValue(v).denominator).toBe(den);
  });

  it('should throw INVALID_CONVERSION for negative result on unsigned unit', () => {
    const num = BigInt(randomInt(2, 100));
    const den = BigInt(randomInt(2, 100));
    const v = UNSIGNED_GBP('1');
    const m = useMutableValue(v);
    m.numerator = -num;
    m.denominator = den;
    expect(() => cleanup(v)).toThrow(Errors.INVALID_CONVERSION('SIGNED', 'UNSIGNED'));
  });

  it('should pass unsigned with positive values', () => {
    const num = BigInt(randomInt(2, 100));
    const den = BigInt(randomInt(2, 100));
    const v = UNSIGNED_GBP('1');
    const m = useMutableValue(v);
    m.numerator = num;
    m.denominator = den;
    cleanup(v);
    expect(useValue(v).numerator).toBe(num);
    expect(useValue(v).denominator).toBe(den);
  });

  it('should return the same value reference', () => {
    const v = GBP('1');
    expect(cleanup(v)).toBe(v);
  });
});
