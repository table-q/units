import { Errors } from 'util/errors';
import { GBP, UNSIGNED_GBP } from 'value/arithmetics/testTypes';

describe('distribute()', () => {
  it('should return an empty array when count is zero', () => {
    expect(GBP('10').distribute(0)).toEqual([]);
  });
  it('should return the value when count is one', () => {
    const result = GBP('10').distribute(1);
    expect(result[0]).toBeUnit('10.00');
  });
  it('should distribute evenly when divisible', () => {
    const result = GBP('10').distribute(2);
    expect(result).toHaveLength(2);
    expect(result[0]).toBeUnit('5.00');
    expect(result[1]).toBeUnit('5.00');
  });
  it('should add remainder to first slots for uneven distribution', () => {
    const result = GBP('10').distribute(3);
    expect(result).toHaveLength(3);
    expect(result[0]).toBeUnit('3.34');
    expect(result[1]).toBeUnit('3.33');
    expect(result[2]).toBeUnit('3.33');
  });
  it('should subtract remainder from first slots for negative values', () => {
    const result = GBP('-10').distribute(3);
    expect(result).toHaveLength(3);
    expect(result[0]).toBeUnit('-3.34');
    expect(result[1]).toBeUnit('-3.33');
    expect(result[2]).toBeUnit('-3.33');
  });
  it('should distribute unsigned values correctly', () => {
    const result = UNSIGNED_GBP('10').distribute(3);
    expect(result).toHaveLength(3);
    expect(result[0]).toBeUnit('4');
    expect(result[1]).toBeUnit('3');
    expect(result[2]).toBeUnit('3');
  });
  it('should produce parts that sum to the original value', () => {
    const total = GBP('1');
    const parts = total.distribute(3);
    const sum = parts.reduce((a, b) => a.add(b));
    expect(sum).toBeUnit('1.00');
  });
  it('should throw for invalid count with float', () => {
    expect(() => GBP('10').distribute(1.5)).toThrow(
      Errors.INVALID_TYPE('count', 'positive integer'),
    );
  });
  it('should throw for invalid count with negative number', () => {
    expect(() => GBP('10').distribute(-1)).toThrow(
      Errors.INVALID_TYPE('count', 'positive integer'),
    );
  });
  it('should distribute unevenly with count of two', () => {
    const result = GBP('1.01').distribute(2);
    expect(result).toHaveLength(2);
    expect(result[0]).toBeUnit('0.51');
    expect(result[1]).toBeUnit('0.50');
  });
  it('should distribute negative value unevenly with count of two', () => {
    const result = GBP('-1.01').distribute(2);
    expect(result).toHaveLength(2);
    expect(result[0]).toBeUnit('-0.51');
    expect(result[1]).toBeUnit('-0.50');
  });
  it('should apply rounding mode with negative value', () => {
    const result = GBP('-1.00').mul('1.001').distribute(3, 'ROUND_UP');
    expect(result).toHaveLength(3);
    expect(result[0]).toBeUnit('-0.34');
    expect(result[1]).toBeUnit('-0.34');
    expect(result[2]).toBeUnit('-0.33');
  });
  it('should apply ROUND_DOWN with decimal places', () => {
    const result = GBP('11.00').distribute(2, 'ROUND_DOWN', 3);
    expect(result).toHaveLength(2);
    expect(result[0]).toBeUnit('5.00');
    expect(result[1]).toBeUnit('5.00');
  });
  it('should maintain sum integrity with rounding mode', () => {
    const result = GBP('1').distribute(3, 'ROUND_HALF_UP', 0);
    expect(result).toHaveLength(3);
    const sum = result.reduce((a, b) => a.add(b));
    expect(sum).toBeUnit('1.00');
  });
});
