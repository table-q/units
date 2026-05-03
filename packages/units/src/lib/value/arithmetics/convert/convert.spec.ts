import { SCALAR } from 'unit';
import { Errors } from 'util/errors';
import { EUR, GBP, PHP, PRECISE_GBP, UNSIGNED_GBP } from 'value/arithmetics/testTypes';

describe('convert()', () => {
  it('should convert between different kinds with a rate', () => {
    expect(GBP('10').convert(PHP, '300.1')).toBeUnit('3001');
    expect(PHP('300').convert(GBP, '-0.001')).toBeUnit('-0.3');
  });

  it('should convert with rate 1 (default) when decimals match', () => {
    expect(GBP('5').convert(EUR)).toBeUnit('5.00');
    expect(EUR('3.50').convert(GBP)).toBeUnit('3.50');
  });

  it('should convert with an explicit rate of 1', () => {
    expect(GBP('5').convert(EUR, '1')).toBeUnit('5.00');
  });

  it('should convert with a fractional rate', () => {
    expect(GBP('10').convert(EUR, '1/2')).toBeUnit('5.00');
    expect(EUR('10').convert(GBP, '3/4')).toBeUnit('7.50');
  });

  it('should scale up when target has more decimals', () => {
    expect(GBP('1.50').convert(PRECISE_GBP)).toBeUnit('1.5000');
    expect(GBP('2.00').convert(PRECISE_GBP, '3')).toBeUnit('6.0000');
  });

  it('should scale down when target has fewer decimals', () => {
    expect(PRECISE_GBP('1.5000').convert(GBP)).toBeUnit('1.50');
    expect(GBP('10').convert(PHP, '50')).toBeUnit('500');
  });

  it('should preserve negative values', () => {
    expect(GBP('-5').convert(EUR, '1.2')).toBeUnit('-6.00');
    expect(GBP('5').convert(EUR, '-1.2')).toBeUnit('-6.00');
  });

  it('should preserve the target kind', () => {
    expect(GBP('1').convert(EUR).kind()).toBe('EUR');
    expect(GBP('1').convert(PHP, '50').kind()).toBe('PHP');
  });

  it('should throw when converting signed to unsigned', () => {
    // @ts-expect-error Converting signed to unsigned
    expect(() => GBP('1').convert(UNSIGNED_GBP, '1')).toThrow(
      Errors.INVALID_CONVERSION('SIGNED', 'UNSIGNED'),
    );
  });

  it('should throw when signed rate produces negative on unsigned target', () => {
    // @ts-expect-error Converting signed to unsigned
    expect(() => GBP('1').convert(UNSIGNED_GBP, '-1')).toThrow(
      Errors.INVALID_CONVERSION('SIGNED', 'UNSIGNED'),
    );
  });

  it('should allow converting unsigned to signed', () => {
    expect(UNSIGNED_GBP('5').convert(GBP, '-1')).toBeUnit('-5');
  });

  it('should accept a Scalar value as the rate', () => {
    expect(GBP('10').convert(EUR, SCALAR('1.2'))).toBeUnit('12.00');
    expect(GBP('10').convert(PHP, SCALAR('300.1'))).toBeUnit('3001');
    expect(GBP('10').convert(EUR, SCALAR('1/2'))).toBeUnit('5.00');
  });

  it('should not mutate a Scalar rate passed in', () => {
    const rate = SCALAR('1.2');
    GBP('10').convert(PRECISE_GBP, rate);
    expect(rate).toBeUnit('1.2');
  });

  it('should throw when a non-SCALAR value is passed as rate', () => {
    // @ts-expect-error rate must be Numeric or Scalar
    expect(() => GBP('10').convert(EUR, GBP('1.2'))).toThrow(
      Errors.INVALID_TYPE('value', 'SCALAR'),
    );
  });
});
