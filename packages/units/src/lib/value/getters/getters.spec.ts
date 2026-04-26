import { SCALAR } from 'unit';

const GBP = SCALAR.clone({
  kind: 'GBP',
  signed: Boolean(0) as false,
  decimals: 1,
  precision: 2,
  bitsize: 5,
});

const PHP = SCALAR.clone({
  kind: 'PHP',
});

describe('isInteger()', () => {
  it('should return true for integer values', () => {
    expect(GBP('1').isInteger()).toBe(true);
    expect(PHP('1').isInteger()).toBe(true);
    expect(PHP('0').isInteger()).toBe(true);
  });
  it('should return false for non-integer values', () => {
    expect(GBP('1.1').isInteger()).toBe(false);
  });
});

describe('isNegative()', () => {
  it('should return true for negative values', () => {
    expect(PHP('-1').isNegative()).toBe(true);
  });
  it('should return false for non-negative values', () => {
    expect(GBP('1').isNegative()).toBe(false);
    expect(GBP('1.1').isNegative()).toBe(false);
    expect(GBP('0').isNegative()).toBe(false);
    expect(PHP('1').isNegative()).toBe(false);
    expect(PHP('0').isNegative()).toBe(false);
  });
});

describe('isSigned()', () => {
  it('should return true for signed units', () => {
    expect(PHP('-1').isSigned()).toBe(true);
  });
  it('should return false for unsigned units', () => {
    expect(GBP('1').isSigned()).toBe(false);
  });
});

describe('kind()', () => {
  it('should return the kind string', () => {
    expect(PHP('-1').kind()).toBe('PHP');
    expect(GBP('1').kind()).toBe('GBP');
  });
});

describe('decimals()', () => {
  it('should return the number of decimals', () => {
    expect(PHP('-1').decimals()).toBe(0);
    expect(GBP('1').decimals()).toBe(1);
  });
});

describe('precision()', () => {
  it('should return the precision value', () => {
    expect(PHP('-1').precision()).toBe(Number.POSITIVE_INFINITY);
    expect(GBP('1').precision()).toBe(2);
  });
});

describe('bitsize()', () => {
  it('should return the bitsize value', () => {
    expect(PHP('-1').bitsize()).toBe(Number.POSITIVE_INFINITY);
    expect(GBP('1').bitsize()).toBe(5);
  });
});
