import { SCALAR } from 'unit';
import { Errors } from 'util/errors';
import { DATA_SYMBOL as _d } from 'util/helpers';

const defaultParams = {
  signed: true,
  decimals: 2,
  precision: Number.POSITIVE_INFINITY,
  bitsize: Number.POSITIVE_INFINITY,
} as const;

describe('Unit', () => {
  describe('createUnitInstance (via SCALAR.clone)', () => {
    it('should create a unit with the correct kind from context', () => {
      const GBP = SCALAR.clone({ ...defaultParams, kind: 'GBP' });
      expect(GBP.kind).toBe('GBP');
    });

    it('should throw on non-string kind', () => {
      // @ts-expect-error testing invalid kind
      expect(() => SCALAR.clone({ ...defaultParams, kind: -1 })).toThrow(
        Errors.INVALID_TYPE('kind', 'string'),
      );
    });

    it('should throw on negative decimals', () => {
      expect(() => SCALAR.clone({ ...defaultParams, kind: 'GBP', decimals: -1 })).toThrow(
        Errors.INVALID_TYPE('decimals', 'positive integer'),
      );
    });

    it('should throw on fractional decimals', () => {
      expect(() => SCALAR.clone({ ...defaultParams, kind: 'GBP', decimals: 1.5 })).toThrow(
        Errors.INVALID_TYPE('decimals', 'positive integer'),
      );
    });

    it('should throw when precision is zero and decimals is zero', () => {
      expect(() =>
        SCALAR.clone({ ...defaultParams, kind: 'GBP', precision: 0, decimals: 0 }),
      ).toThrow(Errors.NOT_PRECISION('precision', 'decimals', 0, 0));
    });

    it('should throw when precision is less than decimals', () => {
      expect(() =>
        SCALAR.clone({ ...defaultParams, kind: 'GBP', precision: 1, decimals: 2 }),
      ).toThrow(Errors.NOT_PRECISION('precision', 'decimals', 1, 2));
    });

    it('should throw on fractional precision', () => {
      expect(() =>
        SCALAR.clone({ ...defaultParams, kind: 'GBP', precision: 1.1, decimals: 0 }),
      ).toThrow(Errors.NOT_PRECISION('precision', 'decimals', 1.1, 0));
    });

    it('should throw on zero bitsize', () => {
      expect(() => SCALAR.clone({ ...defaultParams, kind: 'GBP', bitsize: 0 })).toThrow(
        Errors.NOT_BITSIZE('bitsize', 0),
      );
    });

    it('should throw on negative bitsize', () => {
      expect(() => SCALAR.clone({ ...defaultParams, kind: 'GBP', bitsize: -1 })).toThrow(
        Errors.NOT_BITSIZE('bitsize', -1),
      );
    });

    it('should throw on fractional bitsize', () => {
      expect(() => SCALAR.clone({ ...defaultParams, kind: 'GBP', bitsize: 1.1 })).toThrow(
        Errors.NOT_BITSIZE('bitsize', 1.1),
      );
    });
  });

  describe('context computation', () => {
    it('should compute negative minBigInt and positive maxBigInt for a signed unit', () => {
      const GBP = SCALAR.clone({ ...defaultParams, kind: 'GBP', bitsize: 8 });
      const unit = GBP.unit;
      expect(unit[_d].minBigInt).toBe(-128n);
      expect(unit[_d].maxBigInt).toBe(127n);
    });

    it('should compute zero minBigInt for an unsigned unit', () => {
      const GBP = SCALAR.clone({ ...defaultParams, kind: 'GBP', signed: false, bitsize: 8 });
      const unit = GBP.unit;
      expect(unit[_d].minBigInt).toBe(0n);
      expect(unit[_d].maxBigInt).toBe(255n);
    });

    it('should use Infinity bounds when bitsize is infinite', () => {
      const GBP = SCALAR.clone({ ...defaultParams, kind: 'GBP' });
      const unit = GBP.unit;
      expect(unit[_d].minBigInt).toBe(Number.NEGATIVE_INFINITY);
      expect(unit[_d].maxBigInt).toBe(Number.POSITIVE_INFINITY);
    });

    it('should freeze the context object', () => {
      const GBP = SCALAR.clone({ ...defaultParams, kind: 'GBP' });
      expect(Object.isFrozen(GBP.unit[_d])).toBe(true);
    });
  });

  describe('unit.createValue', () => {
    it('should create a value from a decimal string', () => {
      const GBP = SCALAR.clone({ ...defaultParams, kind: 'GBP' });
      const v = GBP.unit.createValue('1.50');
      expect(v.toDecimal()).toBe('1.50');
    });

    it('should create a value from a raw bigint string when bigint mode is enabled', () => {
      const GBP = SCALAR.clone({ ...defaultParams, kind: 'GBP' });
      const v = GBP.unit.createValue('150', true);
      expect(v.toDecimal()).toBe('1.50');
    });
  });

  describe('unit.fromBigInt', () => {
    it('should create a value from a bigint literal', () => {
      const GBP = SCALAR.clone({ ...defaultParams, kind: 'GBP' });
      expect(GBP.unit.fromBigInt(150n).toDecimal()).toBe('1.50');
    });

    it('should create a value from a safe integer number', () => {
      const GBP = SCALAR.clone({ ...defaultParams, kind: 'GBP' });
      expect(GBP.unit.fromBigInt(150).toDecimal()).toBe('1.50');
    });

    it('should throw when given an unsafe integer', () => {
      const GBP = SCALAR.clone({ ...defaultParams, kind: 'GBP' });
      expect(() => GBP.unit.fromBigInt(Number.MAX_SAFE_INTEGER + 1)).toThrow(
        Errors.INVALID_TYPE('value', 'safe integer'),
      );
    });
  });

  describe('unit.clone', () => {
    it('should clone a unit with overridden properties while preserving the rest', () => {
      const GBP = SCALAR.clone({ ...defaultParams, kind: 'GBP' });
      const cloned = GBP.unit.clone({ decimals: 4 });
      expect(cloned[_d].decimals).toBe(4);
      expect(cloned[_d].kind).toBe('GBP');
    });

    it('should clone a unit without arguments preserving all properties', () => {
      const GBP = SCALAR.clone({ ...defaultParams, kind: 'GBP' });
      const cloned = GBP.unit.clone();
      expect(cloned[_d].kind).toBe('GBP');
      expect(cloned[_d].decimals).toBe(2);
    });
  });

  describe('SCALAR', () => {
    it('should have kind SCALAR', () => {
      expect(SCALAR.kind).toBe('SCALAR');
    });

    it('should be signed with 0 decimals', () => {
      expect(SCALAR.unit[_d].signed).toBe(true);
      expect(SCALAR.unit[_d].decimals).toBe(0);
    });

    it('should create scalar values from string inputs', () => {
      expect(SCALAR('42').toDecimal()).toBe('42');
      expect(SCALAR('-1').toDecimal()).toBe('-1');
    });

    it('should create a scalar value via fromBigInt', () => {
      expect(SCALAR.fromBigInt(42n).toDecimal()).toBe('42');
    });
  });

  describe('createUnit callable', () => {
    it('should create values when invoked as a callable', () => {
      const GBP = SCALAR.clone({ ...defaultParams, kind: 'GBP' });
      expect(GBP('1.50').toDecimal()).toBe('1.50');
    });

    it('should apply the rounding mode when passed as second argument', () => {
      const GBP = SCALAR.clone({ ...defaultParams, kind: 'GBP' });
      expect(GBP('1.555', 'ROUND_DOWN').toDecimal()).toBe('1.55');
    });

    it('should apply the rounding mode with explicit decimal places', () => {
      const GBP = SCALAR.clone({ ...defaultParams, kind: 'GBP' });
      expect(GBP('1.555', 'ROUND_DOWN', 2).toDecimal()).toBe('1.00');
    });

    it('should support instanceof checks via Symbol.hasInstance', () => {
      const GBP = SCALAR.clone({ ...defaultParams, kind: 'GBP' });
      const PHP = SCALAR.clone({ ...defaultParams, kind: 'PHP', decimals: 0 });
      expect(GBP('1') instanceof GBP).toBe(true);
      expect(PHP('1') instanceof GBP).toBe(false);
    });

    it('should expose a toStringTag on the constructor', () => {
      const GBP = SCALAR.clone({ ...defaultParams, kind: 'GBP' });
      expect(Object.prototype.toString.call(GBP)).toBe('[object Constructor<GBP>]');
    });

    it('should create a new unit constructor via clone', () => {
      const GBP = SCALAR.clone({ ...defaultParams, kind: 'GBP' });
      const EUR = GBP.clone({ kind: 'EUR' });
      expect(EUR.kind).toBe('EUR');
      expect(EUR('1').kind()).toBe('EUR');
    });

    it('should create a value via fromBigInt on the constructor', () => {
      const GBP = SCALAR.clone({ ...defaultParams, kind: 'GBP' });
      expect(GBP.fromBigInt(100n).toDecimal()).toBe('1.00');
    });
  });

  describe('minValue / maxValue', () => {
    it('should return correct bounds for a signed 8-bit unit', () => {
      const U8 = SCALAR.clone({ ...defaultParams, kind: 'GBP', bitsize: 8 });
      expect(U8.minValue.toBigInt()).toBe('-128');
      expect(U8.maxValue.toBigInt()).toBe('127');
    });

    it('should return correct bounds for an unsigned 8-bit unit', () => {
      const U8 = SCALAR.clone({ ...defaultParams, kind: 'GBP', signed: false, bitsize: 8 });
      expect(U8.minValue.toBigInt()).toBe('0');
      expect(U8.maxValue.toBigInt()).toBe('255');
    });

    it('should return decimal bounds for a signed 32-bit unit with decimals', () => {
      const GBP32 = SCALAR.clone({ ...defaultParams, kind: 'GBP', bitsize: 32 });
      expect(GBP32.minValue.toDecimal()).toBe('-21474836.48');
      expect(GBP32.maxValue.toDecimal()).toBe('21474836.47');
    });

    it('should return decimal bounds for an unsigned 32-bit unit with decimals', () => {
      const GBP32 = SCALAR.clone({ ...defaultParams, kind: 'GBP', signed: false, bitsize: 32 });
      expect(GBP32.minValue.toDecimal()).toBe('0.00');
      expect(GBP32.maxValue.toDecimal()).toBe('42949672.95');
    });

    it('should throw UNDERFLOW when accessing minValue on an unbounded signed unit', () => {
      expect(() => SCALAR.minValue).toThrow(Errors.UNDERFLOW());
    });

    it('should throw OVERFLOW when accessing maxValue on an unbounded signed unit', () => {
      expect(() => SCALAR.maxValue).toThrow(Errors.OVERFLOW());
    });

    it('should return zero for minValue on an unsigned unbounded unit', () => {
      const U = SCALAR.clone({ ...defaultParams, kind: 'GBP', signed: false });
      expect(U.minValue.toBigInt()).toBe('0');
    });

    it('should throw OVERFLOW when accessing maxValue on an unsigned unbounded unit', () => {
      const U = SCALAR.clone({ ...defaultParams, kind: 'GBP', signed: false });
      expect(() => U.maxValue).toThrow(Errors.OVERFLOW());
    });

    it('should return values that are instanceof their unit', () => {
      const GBP32 = SCALAR.clone({ ...defaultParams, kind: 'GBP', bitsize: 32 });
      expect(GBP32.minValue instanceof GBP32).toBe(true);
      expect(GBP32.maxValue instanceof GBP32).toBe(true);
    });
  });
});
