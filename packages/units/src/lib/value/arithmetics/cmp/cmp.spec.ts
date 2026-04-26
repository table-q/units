import { Errors } from 'util/errors';
import { EUR, GBP, PHP, PRECISE_GBP, UNSIGNED_GBP } from 'value/arithmetics/testTypes';

describe('cmp()', () => {
  it('should compare unsigned with unsigned', () => {
    const a = UNSIGNED_GBP('1');
    expect(a.cmp('2')).toBe(-1);
  });
  it('should compare signed with signed', () => {
    const a = GBP('-1');
    expect(a.cmp('2')).toBe(-1);
    expect(a.cmp('-2')).toBe(1);
  });
  it('should compare signed with unsigned', () => {
    const a = GBP('-3');
    expect(a.cmp('2')).toBe(-1);
  });
  it('should compare unsigned with signed', () => {
    const a = UNSIGNED_GBP('3');
    expect(a.cmp('-2')).toBe(1);
  });
  it('should compare lower decimals with bigger decimals', () => {
    const a = GBP('-2');
    expect(a.cmp(PRECISE_GBP('1.001'))).toBe(-1);
  });
  it('should compare bigger decimals with lower decimals', () => {
    const a = PRECISE_GBP('-2');
    expect(a.cmp(GBP('1.01'))).toBe(-1);
  });
  it('should compare GBP with fraction', () => {
    const a = GBP('1');
    expect(a.cmp('11/11')).toBe(0);
  });
  it('should throw when comparing GBP with float', () => {
    const a = GBP('1');
    // @ts-expect-error comparing GBP with float
    expect(() => a.cmp(1)).toThrow(Errors.INVALID_TYPE('value', 'GBP'));
  });
  it('should evaluate comparison helpers correctly', () => {
    expect(GBP('1.01').gt('1.00')).toBe(true);
    expect(GBP('1.01').gt('1.10')).toBe(false);
    expect(GBP('1.00').gt('1.00')).toBe(false);
    expect(GBP('1.00').gt('-1.00')).toBe(true);
    expect(GBP('-1.00').gt('1.00')).toBe(false);
    expect(GBP('1.01').eq('1.00')).toBe(false);
    expect(GBP('1.01').eq('1.10')).toBe(false);
    expect(GBP('1.00').eq('1.00')).toBe(true);
    expect(GBP('-0').eq('0')).toBe(true);
    expect(GBP('1.01').gte('1.00')).toBe(true);
    expect(GBP('1.01').gte('1.10')).toBe(false);
    expect(GBP('1.00').gte('1.00')).toBe(true);
    expect(GBP('1.00').gte('-1.00')).toBe(true);
    expect(GBP('-1.00').gte('1.00')).toBe(false);
    expect(GBP('1.01').lt('1.00')).toBe(false);
    expect(GBP('1.01').lt('1.10')).toBe(true);
    expect(GBP('1.00').lt('1.00')).toBe(false);
    expect(GBP('1.00').lt('-1.00')).toBe(false);
    expect(GBP('-1.00').lt('1.00')).toBe(true);
    expect(GBP('1.01').lte('1.00')).toBe(false);
    expect(GBP('1.01').lte('1.10')).toBe(true);
    expect(GBP('1.00').lte('1.00')).toBe(true);
    expect(GBP('1.00').lte('-1.00')).toBe(false);
    expect(GBP('-1.00').lte('1.00')).toBe(true);
    expect(GBP('1.01').neq('1.00')).toBe(true);
    expect(GBP('1.01').neq('1.10')).toBe(true);
    expect(GBP('1.00').neq('1.00')).toBe(false);
    expect(GBP('-0').neq('0')).toBe(false);
  });
});

describe('cmp() scaling', () => {
  it('should treat equal values across decimals as equal, low to high', () => {
    expect(GBP('1.00').eq(PRECISE_GBP('1.0000'))).toBe(true);
    expect(GBP('1.23').eq(PRECISE_GBP('1.2300'))).toBe(true);
    expect(GBP('-1.00').eq(PRECISE_GBP('-1.0000'))).toBe(true);
  });
  it('should treat equal values across decimals as equal, high to low', () => {
    expect(PRECISE_GBP('1.0000').eq(GBP('1.00'))).toBe(true);
    expect(PRECISE_GBP('1.2300').eq(GBP('1.23'))).toBe(true);
  });
  it('should detect sub-precision difference when LHS is coarser', () => {
    expect(GBP('1.00').cmp(PRECISE_GBP('1.0001'))).toBe(-1);
    expect(GBP('1.00').cmp(PRECISE_GBP('0.9999'))).toBe(1);
    expect(GBP('1.00').lt(PRECISE_GBP('1.0001'))).toBe(true);
    expect(GBP('1.00').gt(PRECISE_GBP('0.9999'))).toBe(true);
  });
  it('should detect sub-precision difference when LHS is finer', () => {
    expect(PRECISE_GBP('1.0001').cmp(GBP('1.00'))).toBe(1);
    expect(PRECISE_GBP('0.9999').cmp(GBP('1.00'))).toBe(-1);
  });
  it('should treat zero and negative-zero across decimals as equal', () => {
    expect(GBP('0').eq(PRECISE_GBP('0.0000'))).toBe(true);
    expect(GBP('-0').eq(PRECISE_GBP('0.0000'))).toBe(true);
    expect(PRECISE_GBP('-0').eq(GBP('0'))).toBe(true);
  });
  it('should treat integer-decimal unit as equal to decimal unit at same magnitude', () => {
    expect(UNSIGNED_GBP('1').eq(GBP('1.00'))).toBe(true);
    expect(UNSIGNED_GBP('2').gt(GBP('1.00'))).toBe(true);
    expect(UNSIGNED_GBP('1').lt(GBP('1.01'))).toBe(true);
  });
  it('should compare fraction string against high-decimal LHS using multiplier path', () => {
    expect(PRECISE_GBP('1').eq('1/1')).toBe(true);
    expect(PRECISE_GBP('0.5').eq('1/2')).toBe(true);
    expect(PRECISE_GBP('1').gt('1/2')).toBe(true);
    expect(PRECISE_GBP('0.25').eq('1/4')).toBe(true);
  });
  it('should compare decimal string against high-decimal LHS using multiplier path', () => {
    expect(PRECISE_GBP('1.0001').gt('1.0000')).toBe(true);
    expect(PRECISE_GBP('1.0000').eq('1')).toBe(true);
    expect(PRECISE_GBP('1.0000').eq('1.0000')).toBe(true);
  });
  it('should compare sub-unit precise value to string zero', () => {
    expect(PRECISE_GBP('0.0001').gt('0')).toBe(true);
    expect(PRECISE_GBP('0.0001').cmp('0')).toBe(1);
    expect(PRECISE_GBP('-0.0001').lt('0')).toBe(true);
  });
  it('should align zero-decimal LHS with string via multiplier of one', () => {
    expect(PHP('1').eq('1')).toBe(true);
    expect(PHP('1').eq('1/1')).toBe(true);
    expect(PHP('2').gt('1')).toBe(true);
  });
  it('should scale unsigned LHS correctly against signed RHS at different decimals', () => {
    expect(UNSIGNED_GBP('1').eq(PRECISE_GBP('1.0000'))).toBe(true);
    expect(UNSIGNED_GBP('1').lt(PRECISE_GBP('1.0001'))).toBe(true);
  });
});

describe('min()', () => {
  it('should return the smaller of two values', () => {
    expect(GBP('3').min('5')).toBeUnit('3');
    expect(GBP('5').min('3')).toBeUnit('3');
  });
  it('should return a clone of this when equal', () => {
    const a = GBP('3');
    const result = a.min('3');
    expect(result).toBeUnit('3');
    expect(result).not.toBe(a);
  });
  it('should work with a Value parameter', () => {
    expect(GBP('1').min(GBP('2'))).toBeUnit('1');
    expect(GBP('2').min(GBP('1'))).toBeUnit('1');
  });
  it('should work with negative values', () => {
    expect(GBP('-1').min('1')).toBeUnit('-1');
    expect(GBP('1').min('-1')).toBeUnit('-1');
  });
  it('should work with fractions', () => {
    expect(GBP('1').min('1/3')).toBeUnit('1/3');
    expect(GBP('0.01').min('1/3')).toBeUnit('0.01');
  });
  it('should work across different decimals', () => {
    expect(GBP('1.00').min(PRECISE_GBP('0.9999'))).toBeUnit('0.9999');
    expect(GBP('0.99').min(PRECISE_GBP('1.0000'))).toBeUnit('0.99');
  });
  it('should preserve the unit context of this', () => {
    const result = GBP('5').min('3');
    expect(result.kind()).toBe('GBP');
    expect(result.decimals()).toBe(2);
  });
  it('should throw on different kind', () => {
    // @ts-expect-error min GBP with EUR
    expect(() => GBP('1').min(EUR('2'))).toThrow(Errors.INVALID_TYPE('value', 'GBP'));
  });
  it('should not mutate the original value', () => {
    const a = GBP('5');
    a.min('3');
    expect(a).toBeUnit('5');
  });
});

describe('max()', () => {
  it('should return the larger of two values', () => {
    expect(GBP('3').max('5')).toBeUnit('5');
    expect(GBP('5').max('3')).toBeUnit('5');
  });
  it('should return a clone of this when equal', () => {
    const a = GBP('3');
    const result = a.max('3');
    expect(result).toBeUnit('3');
    expect(result).not.toBe(a);
  });
  it('should work with a Value parameter', () => {
    expect(GBP('1').max(GBP('2'))).toBeUnit('2');
    expect(GBP('2').max(GBP('1'))).toBeUnit('2');
  });
  it('should work with negative values', () => {
    expect(GBP('-1').max('1')).toBeUnit('1');
    expect(GBP('1').max('-1')).toBeUnit('1');
  });
  it('should work with fractions', () => {
    expect(GBP('1').max('1/3')).toBeUnit('1');
    expect(GBP('0.01').max('1/3')).toBeUnit('1/3');
  });
  it('should work across different decimals', () => {
    expect(GBP('1.00').max(PRECISE_GBP('1.0001'))).toBeUnit('1.0001');
    expect(GBP('1.01').max(PRECISE_GBP('1.0000'))).toBeUnit('1.01');
  });
  it('should preserve the unit context of this', () => {
    const result = GBP('3').max('5');
    expect(result.kind()).toBe('GBP');
    expect(result.decimals()).toBe(2);
  });
  it('should throw on different kind', () => {
    // @ts-expect-error max GBP with EUR
    expect(() => GBP('1').max(EUR('2'))).toThrow(Errors.INVALID_TYPE('value', 'GBP'));
  });
  it('should not mutate the original value', () => {
    const a = GBP('3');
    a.max('5');
    expect(a).toBeUnit('3');
  });
});
