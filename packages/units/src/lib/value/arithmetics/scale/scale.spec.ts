import { Errors } from 'util/errors';
import { GBP } from 'value/arithmetics/testTypes';

describe('scale()', () => {
  it('should scale up to more decimal places', () => {
    expect(GBP('1.50').scale(4)).toBeUnit('1.5000');
    expect(GBP('1.00').scale(4)).toBeUnit('1.0000');
  });

  it('should scale down to fewer decimal places', () => {
    expect(GBP('2.00').scale(0)).toBeUnit('2');
    expect(GBP('1.50').scale(1)).toBeUnit('1.5');
  });

  it('should be a no-op when toDecimals equals current decimals', () => {
    expect(GBP('1.50').scale(2)).toBeUnit('1.50');
  });

  it('should preserve negative values', () => {
    expect(GBP('-1.50').scale(4)).toBeUnit('-1.5000');
    expect(GBP('-2.00').scale(0)).toBeUnit('-2');
  });

  it('should update decimals() on the result', () => {
    expect(GBP('1.50').scale(4).decimals()).toBe(4);
    expect(GBP('2.00').scale(0).decimals()).toBe(0);
  });

  it('should preserve the unit kind', () => {
    expect(GBP('1.50').scale(4).kind()).toBe('GBP');
    expect(GBP('1.50').scale(0).kind()).toBe('GBP');
  });

  it('should throw on invalid toDecimals', () => {
    expect(() => GBP('1').scale(-1)).toThrow(Errors.INVALID_TYPE('toDecimals', 'positive integer'));
    expect(() => GBP('1').scale(1.5)).toThrow(
      Errors.INVALID_TYPE('toDecimals', 'positive integer'),
    );
  });
});
