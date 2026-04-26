import { SCALAR } from 'unit';
import { Errors } from 'util/errors';

const GBP = SCALAR.clone({
  kind: 'GBP',
  decimals: 2,
  precision: 4,
});

const USD = SCALAR.clone({
  kind: 'USD',
  decimals: 2,
  precision: 2,
});

describe('round() context.precision tests', () => {
  it('should fit a positive balance into 4 precision places', () => {
    const balance = GBP('10.24');
    const asd = balance.mul('2/3');
    const result = balance.mul('1/3').add(asd);
    expect(result).toBeUnit('10.24');
    expect(result.percent('21.345').toDecimal('ROUND_DOWN')).toBe('2.18');
  });
  it('should fit a negative balance into 4 precision places', () => {
    const balance = GBP('-10.24');
    const result = balance.mul('1/3').add(balance.mul('2/3'));
    expect(result).toBeUnit('-10.24');
    expect(result.percent('21.345').toDecimal('ROUND_DOWN')).toBe('-2.18');
  });
  it('should fit a positive balance into 2 precision places', () => {
    const balance = USD('0.24');
    const result = balance.mul('1/3').add(balance.mul('2/3'));
    expect(result).toBeUnit('0.24');
    expect(result.percent('21.345').toDecimal('ROUND_DOWN')).toBe('0.05');
  });
  it('should fit a negative balance into 2 precision places', () => {
    const balance = USD('-0.24');
    const result = balance.mul('1/3').add(balance.mul('2/3'));
    expect(result).toBeUnit('-0.24');
    expect(result.percent('21.345').toDecimal('ROUND_DOWN')).toBe('-0.05');
  });
  it('should throw UNDERFLOW when precision is exceeded negatively', () => {
    expect(() => GBP('-100.00').toString()).toThrow(Errors.UNDERFLOW());
    expect(() => GBP('-100.00').format()).toThrow(Errors.UNDERFLOW());
    expect(() => GBP('-99').sub('1').toDecimal()).toThrow(Errors.UNDERFLOW());
    expect(() => GBP('-99').toDecimal()).not.toThrow();
    expect(() => USD('-1').toString()).toThrow(Errors.UNDERFLOW());
    expect(() => USD('-0.99').toString()).not.toThrow();
  });
  it('should throw OVERFLOW when precision is exceeded positively', () => {
    expect(() => GBP('100.00').toString()).toThrow(Errors.OVERFLOW());
    expect(() => GBP('100.00').format()).toThrow(Errors.OVERFLOW());
    expect(() => GBP('99').add('1').toDecimal()).toThrow(Errors.OVERFLOW());
    expect(() => GBP('99').toDecimal()).not.toThrow();
    expect(() => USD('1').toString()).toThrow(Errors.OVERFLOW());
    expect(() => USD('0.99').toString()).not.toThrow();
  });
});
