import { SCALAR } from 'unit';
import { Errors } from 'util/errors';

// biome-ignore lint/suspicious/noExplicitAny: intentional
const inspect = (value: any) => value?.[Symbol.for('nodejs.util.inspect.custom')]();

const GBP = SCALAR.clone({
  kind: 'GBP',
  bitsize: 32,
  decimals: 2,
});

const PHP = SCALAR.clone({
  kind: 'PHP',
  bitsize: 32,
});

describe('inspect()', () => {
  it('should inspect positive values correctly', () => {
    expect(inspect(GBP('1023'))).toBe('GBP(1023.00)');
    expect(inspect(GBP('1023.1'))).toBe('GBP(1023.10)');
    expect(inspect(GBP('1023.24'))).toBe('GBP(1023.24)');
    expect(inspect(GBP('1').mul('1023.241'))).toBe('GBP(1023.241)');
    expect(inspect(GBP('1').mul('4/3'))).toBe('GBP(4/3)');
    expect(inspect(GBP('0'))).toBe('GBP(0.00)');
    expect(inspect(GBP('0.2'))).toBe('GBP(0.20)');
    expect(inspect(GBP('0.23'))).toBe('GBP(0.23)');
    expect(inspect(GBP('1').mul('0.234'))).toBe('GBP(0.234)');
    expect(inspect(GBP('1').mul('1/3'))).toBe('GBP(1/3)');
    expect(inspect(PHP('1023'))).toBe('PHP(1023)');
  });
  it('should inspect negative values correctly', () => {
    expect(inspect(GBP('-1023'))).toBe('GBP(-1023.00)');
    expect(inspect(GBP('-1023.1'))).toBe('GBP(-1023.10)');
    expect(inspect(GBP('-1023.24'))).toBe('GBP(-1023.24)');
    expect(inspect(GBP('-1').mul('1023.241'))).toBe('GBP(-1023.241)');
    expect(inspect(GBP('-1').mul('4/3'))).toBe('GBP(-4/3)');
    expect(inspect(GBP('-0'))).toBe('GBP(0.00)');
    expect(inspect(GBP('-0.2'))).toBe('GBP(-0.20)');
    expect(inspect(GBP('-0.23'))).toBe('GBP(-0.23)');
    expect(inspect(GBP('-1').mul('0.234'))).toBe('GBP(-0.234)');
    expect(inspect(GBP('-1').mul('1/3'))).toBe('GBP(-1/3)');
    expect(inspect(PHP('-1023'))).toBe('PHP(-1023)');
  });
});

describe('toString()', () => {
  it('should call toDecimal()', () => {
    const value = GBP('1023');
    const fn = vi.spyOn(value, 'toDecimal');
    expect(value.toString()).toBe(GBP('1023').toDecimal());
    expect(fn).toHaveBeenCalledWith();
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('toJSON()', () => {
  it('should call toString()', () => {
    const value = GBP('1023');
    const fn = vi.spyOn(value, 'toString');
    expect(value.toJSON()).toBe(GBP('1023').toString());
    expect(fn).toHaveBeenCalledWith();
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('valueOf()', () => {
  it('should throw an error', () => {
    expect(() => GBP('1').mul('1.00').valueOf()).toThrow(
      Errors.INVALID_CONVERSION('GBP', 'default'),
    );
  });
});

describe('toPrimitive()', () => {
  it('should throw on string coercion', () => {
    expect(() => String(GBP('1').mul('1.00'))).toThrow(Errors.INVALID_CONVERSION('GBP', 'string'));
    // biome-ignore lint/style/useTemplate: tests the 'default' toPrimitive hint, not 'string'
    expect(() => '' + GBP('1').mul('1.00')).toThrow(Errors.INVALID_CONVERSION('GBP', 'default'));
  });
  it('should throw on number coercion', () => {
    expect(() => Number(GBP('1').mul('1.00'))).toThrow(Errors.INVALID_CONVERSION('GBP', 'number'));
    expect(() => +GBP('1').mul('1.00')).toThrow(Errors.INVALID_CONVERSION('GBP', 'number'));
  });
  it('should throw on default coercion', () => {
    // @ts-expect-error Adding can cause errors here
    expect(() => 0 + GBP('1').mul('1.00')).toThrow(Errors.INVALID_CONVERSION('GBP', 'default'));
  });
});

describe('toStringTag()', () => {
  it('should return GBP', () => {
    expect(Object.prototype.toString.call(GBP('1'))).toBe('[object GBP]');
  });
});
