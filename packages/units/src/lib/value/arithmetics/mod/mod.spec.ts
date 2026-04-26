import { SCALAR } from 'unit';
import { Errors } from 'util/errors';
import { GBP, PRECISE_GBP, UNSIGNED_GBP } from 'value/arithmetics/testTypes';

describe('mod()', () => {
  it('should compute modulo of unsigned values', () => {
    const a = UNSIGNED_GBP('28/3');
    expect(a.mod('10/4')).toBeUnit('11/6');
  });
  it('should compute modulo of signed values', () => {
    const a = GBP('-2.23');
    expect(a.mod('-2')).toBeUnit('-0.23');
  });
  it('should compute modulo of signed with unsigned', () => {
    const a = GBP('-2.23');
    expect(a.mod('2')).toBeUnit('-0.23');
  });
  it('should throw when computing modulo of unsigned with signed', () => {
    const a = UNSIGNED_GBP('2.23');
    expect(() => a.mod('-2')).toThrow(Errors.INVALID_CONVERSION('SIGNED', 'UNSIGNED'));
  });
  it('should compute modulo of lower decimals with bigger decimals', () => {
    const a = GBP('2');
    const c = a.mod('1000/1001');
    expect(c).toBeUnit('2/1001');
    expect(c.decimals()).toBe(2);
  });
  it('should compute modulo of bigger decimals with lower decimals', () => {
    const a = PRECISE_GBP('2');
    const c = a.mod('100/101');
    expect(c).toBeUnit('2/101');
    expect(c.decimals()).toBe(4);
  });
  it('should compute modulo of GBP with a Scalar value', () => {
    expect(GBP('7').mod(SCALAR('3'))).toBeUnit('1');
  });
  it('should throw when computing modulo of GBP with float', () => {
    const a = GBP('1');
    // @ts-expect-error dividing GBP with float
    expect(() => a.mod(1)).toThrow(Errors.INVALID_TYPE('value', 'SCALAR'));
  });
  it('should throw DIVISION_BY_ZERO when modulo divisor is zero', () => {
    const a = GBP('1');
    expect(() => a.mod('0')).toThrow(Errors.DIVISION_BY_ZERO());
  });
  it('should maintain precision across chained modulo operations', () => {
    expect(GBP('7/2').mod('2/7').mod('1/14')).toBeUnit('0');
    expect(GBP('-7/2').mod('-2/7').mod('-1/14')).toBeUnit('0');
  });
});
