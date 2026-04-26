import { Errors } from 'util/errors';
import { randomInt } from 'util/test-random';
import {
  EUR,
  GBP,
  PRECISE_GBP,
  UNSIGNED_GBP,
  UNSIGNED_GBP_INTEGER,
  UNSIGNED_GBP_OVERRIDE,
} from 'value/arithmetics/testTypes';

describe('sub()', () => {
  it('should subtract unsigned from unsigned', () => {
    const x = randomInt(2, 50);
    const y = randomInt(1, Number(x) - 1);
    const a = UNSIGNED_GBP(x);
    const b = UNSIGNED_GBP(y);
    expect(a.sub(b)).toBeUnit(`${Number(x) - Number(y)}`);
  });
  it('should subtract signed from signed', () => {
    const a = GBP('1');
    const b = GBP('-2');
    expect(a.sub(b)).toBeUnit('3');
  });
  it('should subtract unsigned from signed', () => {
    const a = GBP('-3');
    const b = UNSIGNED_GBP('2');
    expect(a.sub(b)).toBeUnit('-5');
  });
  it('should throw INVALID_CONVERSION when subtracting signed from unsigned', () => {
    const a = UNSIGNED_GBP('3');
    const b = GBP('-2');
    // @ts-expect-error subtracting signed from unsigned
    expect(() => a.sub(b)).toThrow(Errors.INVALID_CONVERSION('SIGNED', 'UNSIGNED'));
  });
  it('should preserve higher decimals when subtracting lower decimals from bigger decimals', () => {
    const a = PRECISE_GBP('3');
    const b = GBP('-2');
    const c = a.sub(b);
    expect(c).toBeUnit('5');
    expect(c.decimals()).toBe(4);
  });
  it('should preserve lower decimals when subtracting bigger decimals from lower decimals', () => {
    const a = GBP('3');
    const b = PRECISE_GBP('-2');
    const c = a.sub(b);
    expect(c).toBeUnit('5');
    expect(c.decimals()).toBe(2);
  });
  it('should subtract unsigned string from signed value', () => {
    const a = GBP('3');
    expect(a.sub('-1')).toBeUnit('4');
  });
  it('should throw INVALID_CONVERSION when subtracting signed string from unsigned value', () => {
    const a = UNSIGNED_GBP('3');
    expect(() => a.sub('-1')).toThrow(Errors.INVALID_CONVERSION('SIGNED', 'UNSIGNED'));
  });
  it('should throw INVALID_TYPE when subtracting GBP from EUR', () => {
    const a = GBP('1');
    const b = EUR('1');
    // @ts-expect-error subtracting GBP from EUR
    expect(() => a.sub(b)).toThrow(Errors.INVALID_TYPE('value', 'GBP'));
  });
  it('should throw INVALID_TYPE when subtracting float from GBP', () => {
    const a = GBP('2');
    // @ts-expect-error subtracting float from GBP
    expect(() => a.sub(1)).toThrow(Errors.INVALID_TYPE('value', 'GBP'));
  });
  it('should maintain precision across subtractions', () => {
    expect(GBP('1').sub('1')).toBeUnit('0.00');
    expect(GBP('-1').sub('-1')).toBeUnit('0.00');
    expect(GBP('1').mul('1/3').sub(GBP('1').mul('2/3'))).toBeUnit('-1/3');
    expect(GBP('1').mul('-12.001').sub(GBP('1').mul('-0.001'))).toBeUnit('-12.00');
  });
  it('should subtract unsigned value from signed value', () => {
    expect(GBP('1').sub(UNSIGNED_GBP('1'))).toBeUnit('0');
  });
  it('should allow signed override to subtract unsigned and go negative', () => {
    // @ts-expect-error Deducting unsigned minus signed override
    expect(() => UNSIGNED_GBP('1').sub(UNSIGNED_GBP_OVERRIDE('1'))).toThrow(
      Errors.INVALID_CONVERSION('SIGNED', 'UNSIGNED'),
    );
    expect(UNSIGNED_GBP_OVERRIDE('1').sub(UNSIGNED_GBP('2'))).toBeUnit('-1');
  });
  it('should subtract unsigned integer with different decimals from signed value', () => {
    expect(GBP('1').sub(UNSIGNED_GBP_INTEGER('1'))).toBeUnit('0');
  });
  it('should throw UNDERFLOW when unsigned subtraction goes negative', () => {
    expect(() => UNSIGNED_GBP('1').sub('2')).toThrow(Errors.UNDERFLOW());
  });
});
