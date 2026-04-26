import { Errors } from 'util/errors';
import { DATA_SYMBOL as _d } from 'util/helpers';
import { randomInt } from 'util/test-random';
import {
  EUR,
  GBP,
  PHP,
  PRECISE_GBP,
  UNSIGNED_GBP,
  UNSIGNED_GBP_INTEGER,
  USD,
} from 'value/arithmetics/testTypes';

describe('construct()', () => {
  describe('initData', () => {
    it('should set numerator to 0, denominator to 1, and bind the unit', () => {
      const v = GBP('0');
      expect(v[_d].numerator).toBe(0n);
      expect(v[_d].denominator).toBe(1n);
      expect(v[_d].unit[_d].kind).toBe('GBP');
    });
  });

  describe('fromBigIntString', () => {
    it('should parse a positive bigint', () => {
      expect(GBP.fromBigInt(100n)).toBeUnit('1.00');
    });

    it('should parse a negative bigint', () => {
      expect(GBP.fromBigInt(-100n)).toBeUnit('-1.00');
    });

    it('should parse a zero bigint', () => {
      expect(GBP.fromBigInt(0n)).toBeUnit('0.00');
    });

    it('should accept a bigint from a number', () => {
      expect(GBP.fromBigInt(1000)).toBeUnit('10.00');
    });

    it('should accept a bigint from a string', () => {
      expect(GBP.fromBigInt('1000')).toBeUnit('10.00');
    });

    it('should map a small bigint to a fractional decimal', () => {
      expect(GBP.fromBigInt(1n)).toBeUnit('0.01');
    });

    it('should throw INVALID_TYPE for a non-integer string', () => {
      expect(() => GBP.fromBigInt('1/2')).toThrow(Errors.INVALID_TYPE('value', 'bigint'));
    });

    it('should throw INVALID_TYPE for a garbage string', () => {
      expect(() => GBP.fromBigInt('abc')).toThrow(Errors.INVALID_TYPE('value', 'bigint'));
    });

    it('should roundtrip through toBigInt', () => {
      expect(GBP.fromBigInt(1000n).toBigInt()).toBe(String(1000n));
      expect(GBP.fromBigInt('1000').toBigInt()).toBe(String(1000n));
      expect(GBP.fromBigInt(1000).toBigInt()).toBe(String(1000n));
    });
  });

  describe('fromValue', () => {
    it('should accept same kind and same decimals', () => {
      const a = GBP('5');
      const b = GBP(a);
      expect(b).toBeUnit('5.00');
    });

    it('should rescale when same kind but different decimals', () => {
      const precise = PRECISE_GBP('1.2345');
      const coarse = GBP(precise);
      expect(coarse.decimals()).toBe(2);
      expect(coarse).toBeUnit('1.2345');
    });

    it('should throw INVALID_TYPE when kinds differ', () => {
      const eur = EUR('1');
      // @ts-expect-error wrong kind
      expect(() => GBP(eur)).toThrow(Errors.INVALID_TYPE('value', 'GBP'));
    });

    it('should throw INVALID_CONVERSION when signed value goes to unsigned unit', () => {
      const signed = GBP('-1');
      // @ts-expect-error signed to unsigned
      expect(() => UNSIGNED_GBP(signed)).toThrow(Errors.INVALID_CONVERSION('SIGNED', 'UNSIGNED'));
    });

    it('should accept unsigned value into signed unit', () => {
      const unsigned = UNSIGNED_GBP('5');
      const signed = GBP(unsigned);
      expect(signed).toBeUnit('5.00');
    });

    it('should throw on kind mismatch at runtime for dynamic kinds', () => {
      const oneDollar = USD('1');
      expect(() => USD(GBP('1'))).toThrow(Errors.INVALID_TYPE('value', 'USD'));
      // @ts-expect-error Cannot create a dollar from a pound
      expect(() => GBP(oneDollar)).toThrow(Errors.INVALID_TYPE('value', 'GBP'));
    });

    it('should construct from unsigned integer with different decimals into signed', () => {
      expect(GBP(UNSIGNED_GBP_INTEGER('1'))).toBeUnit('1');
    });
  });

  describe('parseFraction', () => {
    it('should parse a simple fraction', () => {
      expect(GBP('1/2')).toBeUnit('1/2');
    });

    it('should parse a negative numerator', () => {
      expect(GBP('-1/2')).toBeUnit('-1/2');
    });

    it('should parse a negative denominator', () => {
      expect(GBP('1/-2')).toBeUnit('-1/2');
    });

    it('should normalize double-negative to positive', () => {
      expect(GBP('-1/-2')).toBeUnit('1/2');
    });

    it('should parse hex in fraction parts', () => {
      expect(GBP('0x64/0o1')).toBeUnit('100.00');
    });

    it('should parse negative hex in fraction parts', () => {
      expect(GBP('-0x64/0o1')).toBeUnit('-100.00');
      expect(GBP('0x64/-0o1')).toBeUnit('-100.00');
      expect(GBP('-0x64/-0o1')).toBeUnit('100.00');
    });

    it('should parse a fraction with zero decimals unit', () => {
      expect(PHP('1/3')).toBeUnit('1/3');
    });

    it('should throw on triple-part fraction', () => {
      // @ts-expect-error bad fraction
      expect(() => GBP('1/2/3')).toThrow(Errors.INVALID_TYPE('value', 'fraction'));
    });

    it('should throw on non-numeric fraction parts', () => {
      // @ts-expect-error bad fraction
      expect(() => GBP('a/b')).toThrow(Errors.INVALID_TYPE('value', 'fraction'));
    });

    it('should throw on alphanumeric fraction part', () => {
      // @ts-expect-error bad fraction
      expect(() => GBP('1/1a')).toThrow(Errors.INVALID_TYPE('value', 'fraction'));
    });

    it('should parse decimals in fraction parts', () => {
      expect(GBP('.1/.1')).toBeUnit('1.00');
      expect(GBP('1./1')).toBeUnit('1.00');
      expect(GBP('1/.1')).toBeUnit('10.00');
      expect(GBP('0.5/0.25')).toBeUnit('2.00');
      expect(GBP('-0.5/0.25')).toBeUnit('-2.00');
      expect(GBP('0.5/-0.25')).toBeUnit('-2.00');
    });
  });

  describe('parseDecimal', () => {
    it('should parse a positive decimal', () => {
      expect(GBP('1.23')).toBeUnit('1.23');
    });

    it('should parse a negative decimal', () => {
      expect(GBP('-1.23')).toBeUnit('-1.23');
    });

    it('should parse zero point something', () => {
      expect(GBP('0.50')).toBeUnit('0.50');
    });

    it('should parse negative zero point something', () => {
      expect(GBP('-0.50')).toBeUnit('-0.50');
    });

    it('should preserve many decimal places as rational', () => {
      expect(GBP('1.23456')).toBeUnit('1.23456');
    });

    it('should parse a single decimal place', () => {
      expect(GBP('1.5')).toBeUnit('1.50');
    });

    it('should trim leading whitespace', () => {
      expect(GBP(' 1.23')).toBeUnit('1.23');
    });

    it('should trim trailing whitespace', () => {
      expect(GBP('1.23 ')).toBeUnit('1.23');
    });

    it('should throw on multiple decimal points', () => {
      // @ts-expect-error bad decimal
      expect(() => GBP('1.1.1')).toThrow(Errors.INVALID_TYPE('value', 'decimal'));
    });

    it('should throw on trailing minus', () => {
      // @ts-expect-error bad decimal
      expect(() => GBP('1.1-')).toThrow(Errors.INVALID_TYPE('value', 'decimal'));
    });

    it('should throw on minus in fractional part', () => {
      // @ts-expect-error bad decimal
      expect(() => GBP('1.-1')).toThrow(Errors.INVALID_TYPE('value', 'decimal'));
    });
  });

  describe('parseInteger', () => {
    it('should parse a positive integer', () => {
      expect(GBP('100')).toBeUnit('100.00');
    });

    it('should parse a negative integer', () => {
      expect(GBP('-100')).toBeUnit('-100.00');
    });

    it('should parse zero', () => {
      expect(GBP('0')).toBeUnit('0.00');
    });

    it('should parse a hex integer', () => {
      expect(GBP('0x64')).toBeUnit('100.00');
    });

    it('should parse a negative hex integer', () => {
      expect(GBP('-0x64')).toBeUnit('-100.00');
    });

    it('should parse an octal integer', () => {
      expect(GBP('0o144')).toBeUnit('100.00');
    });

    it('should parse a negative octal integer', () => {
      expect(GBP('-0o144')).toBeUnit('-100.00');
    });

    it('should parse a binary integer', () => {
      expect(GBP('0b1100100')).toBeUnit('100.00');
    });

    it('should parse a negative binary integer', () => {
      expect(GBP('-0b1100100')).toBeUnit('-100.00');
    });

    it('should trim whitespace', () => {
      const n = randomInt(2, 99);
      expect(GBP(`  ${n}  ` as `${number}`)).toBeUnit(`${n}.00`);
    });

    it('should throw on non-numeric string', () => {
      // @ts-expect-error bad string
      expect(() => GBP('abc')).toThrow(Errors.INVALID_TYPE('value', 'decimal'));
    });

    it('should throw on alphanumeric mix', () => {
      // @ts-expect-error bad string
      expect(() => GBP('1a')).toThrow(Errors.INVALID_TYPE('value', 'decimal'));
    });

    it('should store integer directly for zero-decimals unit', () => {
      const val = PHP('42');
      expect(val[_d].numerator).toBe(42n);
      expect(val[_d].denominator).toBe(1n);
    });
  });

  describe('parseString routing', () => {
    it('should route to parseFraction when / is present', () => {
      const v = GBP('3/4');
      expect(v).toBeUnit('3/4');
    });

    it('should route to parseDecimal when . is present', () => {
      const v = GBP('1.5');
      expect(v).toBeUnit('1.50');
    });

    it('should route to parseInteger otherwise', () => {
      const v = GBP('7');
      expect(v).toBeUnit('7.00');
    });
  });

  describe('cleanup integration', () => {
    it('should reject negative result for unsigned unit', () => {
      expect(() => UNSIGNED_GBP('-1')).toThrow(Errors.INVALID_CONVERSION('SIGNED', 'UNSIGNED'));
    });

    it('should normalize sign to numerator', () => {
      const v = GBP('1/-2');
      expect(v[_d].numerator < 0n).toBe(true);
      expect(v[_d].denominator > 0n).toBe(true);
    });

    it('should normalize double-negative to positive', () => {
      const v = GBP('-1/-2');
      expect(v[_d].numerator > 0n).toBe(true);
      expect(v[_d].denominator > 0n).toBe(true);
    });
  });

  describe('constructor-time rounding', () => {
    it('should round down and trim excess decimals', () => {
      expect(GBP('1.201', 'ROUND_DOWN')).toBeUnit('1.20');
    });

    it('should round down a negative value', () => {
      expect(GBP('-1.201', 'ROUND_DOWN')).toBeUnit('-1.20');
    });

    it('should round with explicit decimal places', () => {
      expect(GBP('-1.201', 'ROUND_DOWN', 2)).toBeUnit('-1.00');
    });
  });

  describe('isInteger after construction', () => {
    it('should report integer input as integer', () => {
      expect(GBP('1').isInteger()).toBe(true);
    });

    it('should report decimal input as not integer', () => {
      expect(GBP('1.20').isInteger()).toBe(false);
    });
  });

  describe('decimals scaling', () => {
    it('should scale integer numerator by 100 for two-decimal unit', () => {
      const v = GBP('1');
      expect(v[_d].numerator).toBe(100n);
      expect(v[_d].denominator).toBe(1n);
    });

    it('should not scale for zero-decimal unit', () => {
      const v = PHP('1');
      expect(v[_d].numerator).toBe(1n);
      expect(v[_d].denominator).toBe(1n);
    });

    it('should scale by 10000 for four-decimal unit', () => {
      const v = PRECISE_GBP('1');
      expect(v[_d].numerator).toBe(10000n);
      expect(v[_d].denominator).toBe(1n);
    });

    it('should scale fraction with two decimals', () => {
      const v = GBP('1/3');
      // 1/3 with decimals=2: numerator=1*100*100=10000, denominator=3*100=300
      // GBP() factory calls normalize() which reduces by GCD(10000,300)=100
      expect(v[_d].numerator).toBe(100n);
      expect(v[_d].denominator).toBe(3n);
    });
  });
});
