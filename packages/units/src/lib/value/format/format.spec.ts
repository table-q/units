import { SCALAR } from 'unit';
import { Errors } from 'util/errors';
import type { ValueFormatParts } from 'value/format/format';

const GBP = SCALAR.clone({
  kind: 'GBP',
  decimals: 2,
  formatter: (parts) =>
    new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: parts.decimals,
      maximumFractionDigits: parts.decimals,
    }).format(parts.decimal as unknown as number),
});

const PHP = SCALAR.clone({
  kind: 'PHP',
});

describe('toBigInt()', () => {
  it('should return the correct bigint string', () => {
    expect(GBP('-1.1').toBigInt()).toEqual('-110');
    expect(PHP('100').toBigInt()).toEqual('100');
  });
  it('should throw on imprecise conversion or unsupported rounding mode', () => {
    expect(() => PHP('1').mul('1.1').toBigInt()).toThrow(Errors.IMPRECISE_CONVERSION());
    expect(() => PHP('1').toBigInt('N/A' as never)).toThrow(
      Errors.UNSUPPORTED_ROUNDING_MODE('N/A'),
    );
    expect(() => PHP('1').toBigInt('ROUND_CEIL', Number.POSITIVE_INFINITY)).toThrow(
      Errors.INVALID_TYPE('roundingDecimalPlaces', 'positive integer'),
    );
  });
});

describe('toFraction()', () => {
  it('should return the correct fraction string', () => {
    expect(GBP('9/3').toFraction()).toEqual('3/1');
    expect(PHP('12/-1').toFraction()).toEqual('-12/1');
    expect(PHP('1/3').toFraction()).toEqual('1/3');
  });
});

describe('formatToParts()', () => {
  it('should return the correct parts object', () => {
    expect(GBP('-1.1').formatToParts()).toEqual({
      bigint: -110n,
      decimal: '-1.10',
      decimals: 2,
      fraction: '10',
      integer: '1',
      kind: 'GBP',
      negative: true,
      precision: Number.POSITIVE_INFINITY,
      bitsize: Number.POSITIVE_INFINITY,
    });
    expect(PHP('100').formatToParts()).toEqual({
      bigint: 100n,
      decimal: '100',
      decimals: 0,
      fraction: '',
      integer: '100',
      kind: 'PHP',
      negative: false,
      precision: Number.POSITIVE_INFINITY,
      bitsize: Number.POSITIVE_INFINITY,
    });
  });
  it('should throw on imprecise conversion or unsupported rounding mode', () => {
    expect(() => PHP('1').mul('1.1').formatToParts()).toThrow(Errors.IMPRECISE_CONVERSION());
    expect(() => PHP('1').formatToParts('N/A' as never)).toThrow(
      Errors.UNSUPPORTED_ROUNDING_MODE('N/A'),
    );
    expect(() => PHP('1').formatToParts('ROUND_CEIL', Number.POSITIVE_INFINITY)).toThrow(
      Errors.INVALID_TYPE('roundingDecimalPlaces', 'positive integer'),
    );
  });
});

describe('toDecimal()', () => {
  it('should return the correct decimal string', () => {
    expect(GBP('1.11').toDecimal()).toEqual('1.11');
    expect(GBP('-1.1').toDecimal()).toEqual('-1.10');
    expect(PHP('100').toDecimal()).toEqual('100');
  });
  it('should throw on imprecise conversion or unsupported rounding mode', () => {
    expect(() => PHP('1').mul('1.1').toDecimal()).toThrow(Errors.IMPRECISE_CONVERSION());
    expect(() => PHP('1').toDecimal('N/A' as never)).toThrow(
      Errors.UNSUPPORTED_ROUNDING_MODE('N/A'),
    );
    expect(() => PHP('1').toDecimal('ROUND_CEIL', Number.POSITIVE_INFINITY)).toThrow(
      Errors.INVALID_TYPE('roundingDecimalPlaces', 'positive integer'),
    );
  });
});

describe('format()', () => {
  it('should return the formatted currency string', () => {
    expect(GBP('1').format()).toBe('£1.00');
    expect(GBP('-1').format()).toBe('-£1.00');
  });
  it('should call the formatter', () => {
    const formatter = vi.fn((parts: ValueFormatParts) => parts.decimal);
    const TEST = SCALAR.clone({
      kind: 'TEST',
      formatter,
    });
    expect(TEST('1').format()).toBe('1');
    expect(formatter).toHaveBeenCalledTimes(1);
    expect(formatter).toHaveBeenCalledWith({
      bigint: 1n,
      bitsize: Number.POSITIVE_INFINITY,
      decimal: '1',
      decimals: 0,
      fraction: '',
      integer: '1',
      kind: 'TEST',
      negative: false,
      precision: Number.POSITIVE_INFINITY,
    });
  });
  it('should throw on imprecise conversion or unsupported rounding mode', () => {
    expect(() => PHP('1').mul('1.1').format()).toThrow(Errors.IMPRECISE_CONVERSION());
    expect(() => PHP('1').format('N/A' as never)).toThrow(Errors.UNSUPPORTED_ROUNDING_MODE('N/A'));
    expect(() => PHP('1').format('ROUND_CEIL', Number.POSITIVE_INFINITY)).toThrow(
      Errors.INVALID_TYPE('roundingDecimalPlaces', 'positive integer'),
    );
  });
});
