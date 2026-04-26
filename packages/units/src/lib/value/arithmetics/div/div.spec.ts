import { SCALAR } from 'unit';
import { Errors } from 'util/errors';
import { randomInt } from 'util/test-random';
import { EUR, GBP, PRECISE_GBP, UNSIGNED_GBP } from 'value/arithmetics/testTypes';

describe('div()', () => {
  it('should divide unsigned by unsigned', () => {
    const a = UNSIGNED_GBP('2');
    expect(a.div('1')).toBeUnit('2');
  });
  it('should divide signed by signed', () => {
    const a = GBP('-2');
    expect(a.div('1')).toBeUnit('-2');
    expect(a.div('-1')).toBeUnit('2');
  });
  it('should divide signed by unsigned', () => {
    const a = GBP('-3');
    expect(a.div('1/2')).toBeUnit('-6');
  });
  it('should throw INVALID_CONVERSION when dividing unsigned by signed', () => {
    const a = UNSIGNED_GBP('3');
    expect(() => a.div('-1/2')).toThrow(Errors.INVALID_CONVERSION('SIGNED', 'UNSIGNED'));
  });
  it('should preserve decimals when dividing lower decimals by bigger decimals', () => {
    const a = GBP('-2');
    const c = a.div('1000/1001');
    expect(c).toBeUnit('-2.002');
    expect(c.decimals()).toBe(2);
  });
  it('should preserve decimals when dividing bigger decimals by lower decimals', () => {
    const a = PRECISE_GBP('-2');
    const c = a.div('100/101');
    expect(c).toBeUnit('-2.02');
    expect(c.decimals()).toBe(4);
  });
  it('should divide GBP by a fraction', () => {
    const a = GBP('1');
    expect(a.div('3/2')).toBeUnit('2/3');
  });
  it('should divide GBP by a Scalar value', () => {
    expect(GBP('6').div(SCALAR('2'))).toBeUnit('3');
  });
  it('should throw INVALID_TYPE when dividing GBP by a float', () => {
    const a = GBP('1');
    // @ts-expect-error dividing GBP with float
    expect(() => a.div(1)).toThrow(Errors.INVALID_TYPE('value', 'SCALAR'));
  });
  it('should throw DIVISION_BY_ZERO when dividing by zero', () => {
    const a = GBP('1');
    expect(() => a.div('0')).toThrow(Errors.DIVISION_BY_ZERO());
  });
  it('should throw INVALID_CONVERSION when unsigned div uses signed fraction', () => {
    expect(() => UNSIGNED_GBP('1').div(GBP('-1').toFraction())).toThrow(
      Errors.INVALID_CONVERSION('SIGNED', 'UNSIGNED'),
    );
  });
  it('should allow signed div with unsigned fraction', () => {
    expect(GBP('-1').div(UNSIGNED_GBP('2').toFraction())).toBeUnit('-1/2');
  });
  it('should return scalar for same-kind division', () => {
    const x = randomInt(2, 50);
    const y = randomInt(1, 10);
    const product = `${Number(x) * Number(y)}` as `${number}`;
    const result = GBP(product).div(GBP(y));
    expect(result).toBeUnit(x);
    expect(result.kind()).toBe('SCALAR');
    expect(result.decimals()).toBe(0);
  });
  it('should return scalar fraction for same-kind division with remainder', () => {
    const result = GBP('1').div(GBP('3'));
    expect(result).toBeUnit('1/3');
    expect(result.kind()).toBe('SCALAR');
  });
  it('should return scalar for same-kind division with different decimals', () => {
    const result = PRECISE_GBP('10').div(GBP('5'));
    expect(result).toBeUnit('2');
    expect(result.kind()).toBe('SCALAR');
  });
  it('should preserve sign in same-kind division', () => {
    expect(GBP('-10').div(GBP('5')).isNegative()).toBe(true);
    expect(GBP('10').div(GBP('-5')).isNegative()).toBe(true);
    expect(GBP('-10').div(GBP('-5')).isNegative()).toBe(false);
  });
  it('should throw DIVISION_BY_ZERO for same-kind division by zero', () => {
    expect(() => GBP('1').div(GBP('0'))).toThrow(Errors.DIVISION_BY_ZERO());
  });
  it('should throw INVALID_TYPE for different-kind division', () => {
    // @ts-expect-error dividing GBP by EUR
    expect(() => GBP('1').div(EUR('1'))).toThrow(Errors.INVALID_TYPE('value', 'SCALAR'));
  });
  it('should maintain precision across divisions', () => {
    expect(GBP('1').div('3').div('1/3')).toBeUnit('1');
    expect(GBP('1').div('-10000/12001').div('10')).toBeUnit('-0.12001');
  });
});
