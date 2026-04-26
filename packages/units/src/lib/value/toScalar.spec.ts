import { SCALAR } from 'unit';
import { randomInt } from 'util/test-random';
import { EUR, GBP, PHP, PRECISE_GBP, UNSIGNED_GBP } from 'value/arithmetics/testTypes';

const a = randomInt(2, 99);
const b = randomInt(2, 99);
const c = randomInt(2, 99);

describe('toScalar()', () => {
  it('should convert an integer GBP to a scalar with the same mathematical value', () => {
    const result = GBP(a).toScalar();
    expect(result).toBeUnit(a);
    expect(result.kind()).toBe('SCALAR');
    expect(result.decimals()).toBe(0);
  });

  it('should preserve the rational value for a fractional GBP', () => {
    const result = GBP('1.50').toScalar();
    expect(result).toBeUnit('3/2');
    expect(result.kind()).toBe('SCALAR');
  });

  it('should be a no-op on the fraction for a zero-decimal unit', () => {
    const result = PHP(b).toScalar();
    expect(result).toBeUnit(b);
    expect(result.kind()).toBe('SCALAR');
  });

  it('should preserve precision for a high-decimal unit', () => {
    const result = PRECISE_GBP('1.2345').toScalar();
    expect(result).toBeUnit('1.2345');
    expect(result.kind()).toBe('SCALAR');
  });

  it('should handle a negative value correctly', () => {
    const result = GBP('-3.25').toScalar();
    expect(result).toBeUnit('-13/4');
    expect(result.isNegative()).toBe(true);
  });

  it('should handle zero correctly', () => {
    const result = GBP('0').toScalar();
    expect(result).toBeUnit('0');
  });

  it('should convert an unsigned value to a signed scalar', () => {
    const result = UNSIGNED_GBP(a).toScalar();
    expect(result).toBeUnit(a);
    expect(result.isSigned()).toBe(true);
  });

  it('should produce a correct result for a non-reduced fraction', () => {
    const result = GBP('1').mul('1/3').toScalar();
    expect(result).toBeUnit('1/3');
  });

  it('should return identity when converting a scalar to a scalar', () => {
    const result = SCALAR(c).toScalar();
    expect(result).toBeUnit(c);
    expect(result.kind()).toBe('SCALAR');
  });

  it('should not mutate the original value', () => {
    const v = GBP(a);
    v.toScalar();
    expect(v).toBeUnit(a);
    expect(v.kind()).toBe('GBP');
  });

  it('should produce a result that can be used in further scalar arithmetic', () => {
    const s = GBP('3').toScalar();
    expect(s.mul('2')).toBeUnit('6');
    expect(GBP('10').mul(s)).toBeUnit('30');
  });

  it('should produce equivalent scalars for the same mathematical value across different kinds', () => {
    const gbpScalar = GBP('1.50').toScalar();
    const eurScalar = EUR('1.50').toScalar();
    expect(gbpScalar.eq(eurScalar)).toBe(true);
  });
});
