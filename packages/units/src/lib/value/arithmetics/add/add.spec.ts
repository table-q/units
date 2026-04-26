import { Errors } from 'util/errors';
import { randomInt } from 'util/test-random';
import {
  EUR,
  GBP,
  PRECISE_GBP,
  UNSIGNED_GBP,
  UNSIGNED_GBP_INTEGER,
} from 'value/arithmetics/testTypes';

describe('add()', () => {
  it('should add unsigned to unsigned', () => {
    const x = randomInt(1, 50);
    const y = randomInt(1, 50);
    const a = UNSIGNED_GBP(x);
    const b = UNSIGNED_GBP(y);
    expect(a.add(b)).toBeUnit(`${Number(x) + Number(y)}`);
  });
  it('should add signed to signed', () => {
    const a = GBP('1');
    const b = GBP('-2');
    expect(a.add(b)).toBeUnit('-1');
  });
  it('should add unsigned to signed', () => {
    const a = GBP('-3');
    const b = UNSIGNED_GBP('2');
    expect(a.add(b)).toBeUnit('-1');
  });
  it('should throw INVALID_CONVERSION when adding signed to unsigned', () => {
    const a = UNSIGNED_GBP('3');
    const b = GBP('-2');
    // @ts-expect-error adding signed to unsigned
    expect(() => a.add(b)).toThrow(Errors.INVALID_CONVERSION('SIGNED', 'UNSIGNED'));
  });
  it('should preserve higher decimals when adding lower decimals to bigger decimals', () => {
    const a = PRECISE_GBP('3');
    const b = GBP('-2');
    const c = a.add(b);
    expect(c).toBeUnit('1');
    expect(c.decimals()).toBe(4);
  });
  it('should preserve lower decimals when adding bigger decimals to lower decimals', () => {
    const a = GBP('3');
    const b = PRECISE_GBP('-2');
    const c = a.add(b);
    expect(c).toBeUnit('1');
    expect(c.decimals()).toBe(2);
  });
  it('should add unsigned string to signed value', () => {
    const a = GBP('3');
    expect(a.add('-1')).toBeUnit('2');
  });
  it('should throw INVALID_CONVERSION when adding signed string to unsigned value', () => {
    const a = UNSIGNED_GBP('3');
    expect(() => a.add('-1')).toThrow(Errors.INVALID_CONVERSION('SIGNED', 'UNSIGNED'));
  });
  it('should throw INVALID_TYPE when adding GBP to EUR', () => {
    const a = GBP('1');
    const b = EUR('1');
    // @ts-expect-error adding GBP to EUR
    expect(() => a.add(b)).toThrow(Errors.INVALID_TYPE('value', 'GBP'));
  });
  it('should throw INVALID_TYPE when adding float to GBP', () => {
    const a = GBP('1');
    // @ts-expect-error adding float to GBP
    expect(() => a.add(1)).toThrow(Errors.INVALID_TYPE('value', 'GBP'));
  });
  it('should add unsigned value to signed value', () => {
    expect(GBP('1').add(UNSIGNED_GBP('1'))).toBeUnit('2');
  });
  it('should add unsigned integer with different decimals to signed value', () => {
    expect(GBP('1').add(UNSIGNED_GBP_INTEGER('1'))).toBeUnit('2');
  });
  it('should maintain precision across additions', () => {
    expect(GBP('1').add('-1')).toBeUnit('0.00');
    expect(GBP('-1').add('1')).toBeUnit('0.00');
    expect(GBP('1').mul('1/3').add(GBP('1').mul('2/3'))).toBeUnit('1.00');
    expect(GBP('1').mul('-12.001').add(GBP('1').mul('0.001'))).toBeUnit('-12.00');
  });
});
