import { Errors } from 'util/errors';
import { GBP, UNSIGNED_GBP } from 'value/arithmetics/testTypes';

describe('pow()', () => {
  it('should return the value for power 1 and one for power 0', () => {
    const a = UNSIGNED_GBP('2');
    expect(a.pow(1)).toBeUnit('2');
    expect(a.pow(0)).toBeUnit('1');
  });
  it('should compute power of unsigned values', () => {
    const a = UNSIGNED_GBP('2');
    expect(a.pow(2)).toBeUnit('4');
  });
  it('should throw when raising to a negative power', () => {
    const a = GBP('-2');
    expect(() => a.pow(-2)).toThrow(Errors.INVALID_TYPE('power', 'positive integer'));
  });
  it('should compute power of a signed value with unsigned exponent', () => {
    const a = GBP('-2');
    expect(a.pow(2)).toBeUnit('4');
    expect(a.pow(3)).toBeUnit('-8');
  });
  it('should throw when passing string to pow', () => {
    const a = GBP('1');
    // @ts-expect-error passing string to pow
    expect(() => a.pow('1')).toThrow(Errors.INVALID_TYPE('power', 'positive integer'));
  });
  it('should maintain precision across power operations', () => {
    expect(GBP('1/3').pow(2).mul('9')).toBeUnit('1');
    expect(GBP('0.97').pow(11)).toBeUnit('7153014030880804126753/10000000000000000000000');
    expect(GBP('1.97').pow(11)).toBeUnit('17343170265605241347130653/10000000000000000000000');
  });
});
