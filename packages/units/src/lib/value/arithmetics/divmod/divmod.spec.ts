import { SCALAR } from 'unit';
import { Errors } from 'util/errors';
import { GBP, UNSIGNED_GBP } from 'value/arithmetics/testTypes';

describe('divmod()', () => {
  it('should return [integer quotient, remainder] for an exact division', () => {
    const [q, r] = SCALAR('12').divmod('4');
    expect(q).toBeUnit('3');
    expect(r).toBeUnit('0');
  });

  it('should return [integer quotient, remainder] for a non-exact division', () => {
    const [q, r] = SCALAR('14').divmod('4');
    expect(q).toBeUnit('3');
    expect(r).toBeUnit('2');
  });

  it('should match a + b * q + r identity', () => {
    const a = SCALAR('131');
    const [q, r] = a.divmod('500');
    expect(q).toBeUnit('0');
    expect(r).toBeUnit('131');
    expect(q.mul('500').add(r)).toBeUnit('131');
  });

  it('should preserve the unit on both quotient and remainder', () => {
    const [q, r] = GBP('15.50').divmod('4');
    expect(q.kind()).toBe('GBP');
    expect(r.kind()).toBe('GBP');
    expect(q).toBeUnit('3.00');
    expect(r).toBeUnit('3.50');
  });

  it('should accept a Scalar divisor', () => {
    const [q, r] = SCALAR('14').divmod(SCALAR('4'));
    expect(q).toBeUnit('3');
    expect(r).toBeUnit('2');
  });

  it('should throw on division by zero', () => {
    expect(() => SCALAR('5').divmod('0')).toThrow(Errors.DIVISION_BY_ZERO());
  });

  it('should throw when an unsigned value is divided by a negative divisor', () => {
    expect(() => UNSIGNED_GBP('5').divmod('-2')).toThrow(
      Errors.INVALID_CONVERSION('SIGNED', 'UNSIGNED'),
    );
  });

  it('should throw when a non-SCALAR Value is passed as divisor', () => {
    // @ts-expect-error divisor must be Numeric or Scalar
    expect(() => GBP('5').divmod(GBP('2'))).toThrow(Errors.INVALID_TYPE('value', 'SCALAR'));
  });

  it('should truncate toward zero on negative dividends (matching mod)', () => {
    const [q, r] = SCALAR('-7').divmod('2');
    expect(q).toBeUnit('-3');
    expect(r).toBeUnit('-1');
    expect(q.mul('2').add(r)).toBeUnit('-7');
  });
});
