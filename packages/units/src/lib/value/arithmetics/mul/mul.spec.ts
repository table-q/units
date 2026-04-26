import { SCALAR } from 'unit';
import { Errors } from 'util/errors';
import { randomInt } from 'util/test-random';
import { GBP, PRECISE_GBP, UNSIGNED_GBP } from 'value/arithmetics/testTypes';

describe('mul()', () => {
  it('should multiply unsigned by unsigned', () => {
    const x = randomInt(1, 50);
    const y = randomInt(1, 50);
    const a = UNSIGNED_GBP(x);
    expect(a.mul(y)).toBeUnit(`${Number(x) * Number(y)}`);
  });
  it('should multiply signed by signed', () => {
    const a = GBP('-1');
    expect(a.mul('2')).toBeUnit('-2');
    expect(a.mul('-2')).toBeUnit('2');
  });
  it('should multiply signed by unsigned', () => {
    const a = GBP('-3');
    expect(a.mul('2')).toBeUnit('-6');
  });
  it('should throw INVALID_CONVERSION when multiplying unsigned by signed', () => {
    const a = UNSIGNED_GBP('3');
    expect(() => a.mul('-2')).toThrow(Errors.INVALID_CONVERSION('SIGNED', 'UNSIGNED'));
  });
  it('should preserve decimals when multiplying lower decimals by bigger decimals', () => {
    const a = GBP('-2');
    const c = a.mul('1.001');
    expect(c).toBeUnit('-2.002');
    expect(c.decimals()).toBe(2);
  });
  it('should preserve decimals when multiplying bigger decimals by lower decimals', () => {
    const a = PRECISE_GBP('-2');
    const c = a.mul('1.01');
    expect(c).toBeUnit('-2.02');
    expect(c.decimals()).toBe(4);
  });
  it('should multiply GBP by a fraction', () => {
    const a = GBP('1');
    expect(a.mul('2/3')).toBeUnit('2/3');
  });
  it('should multiply GBP by a Scalar value', () => {
    expect(GBP('3').mul(SCALAR('2'))).toBeUnit('6');
  });
  it('should throw INVALID_TYPE when multiplying GBP by a float', () => {
    const a = GBP('1');
    // @ts-expect-error multiplying GBP with float
    expect(() => a.mul(1)).toThrow(Errors.INVALID_TYPE('value', 'SCALAR'));
  });
  it('should throw INVALID_CONVERSION when unsigned mul uses signed fraction', () => {
    expect(() => UNSIGNED_GBP('1').mul(GBP('-1').toFraction())).toThrow(
      Errors.INVALID_CONVERSION('SIGNED', 'UNSIGNED'),
    );
  });
  it('should allow signed mul with unsigned fraction', () => {
    expect(GBP('-1').mul(UNSIGNED_GBP('2').toFraction())).toBeUnit('-2');
  });
  it('should maintain precision across multiplications', () => {
    expect(GBP('1').mul('1/3').mul('3/1')).toBeUnit('1');
    expect(GBP('1').mul('-12.001').mul('10')).toBeUnit('-120.01');
  });
});
