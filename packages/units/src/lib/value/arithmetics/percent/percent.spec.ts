import { SCALAR } from 'unit';
import { Errors } from 'util/errors';
import { GBP, PRECISE_GBP, UNSIGNED_GBP } from 'value/arithmetics/testTypes';

describe('percent()', () => {
  it('should calculate percent of an unsigned value', () => {
    const a = UNSIGNED_GBP('2');
    expect(a.percent('1')).toBeUnit('0.02');
  });
  it('should calculate percent of a signed value', () => {
    const a = GBP('-2');
    expect(a.percent('1')).toBeUnit('-0.02');
    expect(a.percent('-1')).toBeUnit('0.02');
  });
  it('should calculate percent of signed with unsigned', () => {
    const a = GBP('-3');
    expect(a.percent('1/2')).toBeUnit('-0.015');
  });
  it('should throw when calculating percent of unsigned with signed', () => {
    const a = UNSIGNED_GBP('3');
    expect(() => a.percent('-1/2')).toThrow(Errors.INVALID_CONVERSION('SIGNED', 'UNSIGNED'));
  });
  it('should calculate percent of lower decimals with bigger decimals', () => {
    const a = GBP('-2');
    const c = a.percent('1000/1001');
    expect(c).toBeUnit('-20/1001');
    expect(c.decimals()).toBe(2);
  });
  it('should calculate percent of bigger decimals with lower decimals', () => {
    const a = PRECISE_GBP('-2');
    const c = a.percent('100/101');
    expect(c).toBeUnit('-2/101');
    expect(c.decimals()).toBe(4);
  });
  it('should calculate percent of GBP with a fraction', () => {
    const a = GBP('1');
    expect(a.percent('300/2')).toBeUnit('15/10');
  });
  it('should calculate percent of GBP with a Scalar value', () => {
    expect(GBP('100').percent(SCALAR('50'))).toBeUnit('50');
  });
  it('should throw when calculating percent of GBP with float', () => {
    const a = GBP('1');
    // @ts-expect-error percent GBP with float
    expect(() => a.percent(1)).toThrow(Errors.INVALID_TYPE('value', 'SCALAR'));
  });
  it('should return zero when percent rate is zero', () => {
    const a = GBP('1');
    expect(a.percent('0')).toBeUnit('0');
  });
  it('should maintain precision across chained percent operations', () => {
    expect(GBP('1').percent('3').percent('10000/3')).toBeUnit('1');
    expect(GBP('1').percent('-10000/3').percent('3')).toBeUnit('-1');
  });
});
