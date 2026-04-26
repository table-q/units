import { DATA_SYMBOL as _d } from 'util/helpers';
import { randomDecimal, randomInt } from 'util/test-random';
import { EUR, GBP, UNSIGNED_GBP } from 'value/arithmetics/testTypes';
import { useContext, useMutableValue, useUnit, useValue } from 'value/hooks';

describe('hooks', () => {
  describe('useValue', () => {
    it('should return the internal ValueData', () => {
      const dec = randomDecimal(1, 99, 2);
      const v = GBP(dec);
      const data = useValue(v);
      expect(data).toBe(v[_d]);
      expect(data.numerator).toBe(BigInt(dec.replace('.', '')));
      expect(data.denominator).toBe(1n);
      expect(data.unit).toBe(v[_d].unit);
    });

    it('should return the same [_d] reference as a readonly view', () => {
      const v = GBP('1');
      expect(useValue(v)).toBe(v[_d]);
    });

    it('should treat numerator as readonly at the type level', () => {
      const v = GBP('1');
      // @ts-expect-error numerator is readonly via useValue
      useValue(v).numerator = BigInt(randomInt(100, 9999));
    });

    it('should treat denominator as readonly at the type level', () => {
      const v = GBP('1');
      // @ts-expect-error denominator is readonly via useValue
      useValue(v).denominator = BigInt(randomInt(100, 9999));
    });

    it('should treat unit as readonly at the type level', () => {
      const v = GBP('1');
      // @ts-expect-error unit is readonly via useValue
      useValue(v).unit = useValue(GBP('2')).unit;
    });

    it('should make direct [_d].numerator write a type error', () => {
      const v = GBP('1');
      // @ts-expect-error numerator is readonly on Value[_d]
      v[_d].numerator = BigInt(randomInt(100, 9999));
    });

    it('should make direct [_d].denominator write a type error', () => {
      const v = GBP('1');
      // @ts-expect-error denominator is readonly on Value[_d]
      v[_d].denominator = BigInt(randomInt(100, 9999));
    });
  });

  describe('useMutableValue', () => {
    it('should return a mutable reference to the same [_d]', () => {
      const val = BigInt(randomInt(100, 9999));
      const v = GBP('1');
      const data = useMutableValue(v);
      data.numerator = val;
      expect(v[_d].numerator).toBe(val);
    });

    it('should return the same backing object as useValue', () => {
      const v = GBP('1');
      expect(useMutableValue(v)).toBe(useValue(v));
    });

    it('should allow writing numerator without a type error', () => {
      const val = BigInt(randomInt(1, 100));
      const v = GBP('1');
      useMutableValue(v).numerator = val;
      expect(v[_d].numerator).toBe(val);
    });

    it('should allow writing denominator without a type error', () => {
      const val = BigInt(randomInt(1, 100));
      const v = GBP('1');
      useMutableValue(v).denominator = val;
      expect(v[_d].denominator).toBe(val);
    });
  });

  describe('useContext', () => {
    it('should return the FullContext from the unit', () => {
      const v = GBP('1');
      const ctx = useContext(v);
      expect(ctx.kind).toBe('GBP');
      expect(ctx.decimals).toBe(2);
      expect(ctx.signed).toBe(true);
    });

    it('should return unsigned context for unsigned unit', () => {
      const v = UNSIGNED_GBP('1');
      const ctx = useContext(v);
      expect(ctx.signed).toBe(false);
    });

    it('should return empty object for nullish value', () => {
      const ctx = useContext(null as never);
      expect(ctx).toEqual({});
    });

    it('should treat kind as readonly at the type level and frozen at runtime', () => {
      const v = GBP('1');
      expect(() => {
        // @ts-expect-error kind is readonly via useContext
        useContext(v).kind = 'EUR';
      }).toThrow();
    });

    it('should treat decimals as readonly at the type level and frozen at runtime', () => {
      const v = GBP('1');
      expect(() => {
        // @ts-expect-error decimals is readonly via useContext
        useContext(v).decimals = 99;
      }).toThrow();
    });

    it('should treat signed as readonly at the type level and frozen at runtime', () => {
      const v = GBP('1');
      expect(() => {
        // @ts-expect-error signed is readonly via useContext
        useContext(v).signed = false;
      }).toThrow();
    });

    it('should treat minBigInt as readonly at the type level and frozen at runtime', () => {
      const v = GBP('1');
      expect(() => {
        // @ts-expect-error minBigInt is readonly via useContext
        useContext(v).minBigInt = 0n;
      }).toThrow();
    });

    it('should treat maxBigInt as readonly at the type level and frozen at runtime', () => {
      const v = GBP('1');
      expect(() => {
        // @ts-expect-error maxBigInt is readonly via useContext
        useContext(v).maxBigInt = 0n;
      }).toThrow();
    });
  });

  describe('useUnit', () => {
    it('should return the Unit instance', () => {
      const v = GBP('1');
      const unit = useUnit(v);
      expect(unit).toBe(v[_d].unit);
      expect(unit[_d].kind).toBe('GBP');
    });

    it('should share the same unit for different values from same constructor', () => {
      const a = GBP('1');
      const b = GBP('2');
      expect(useUnit(a)).toBe(useUnit(b));
    });

    it('should yield different units for different constructors', () => {
      const gbp = GBP('1');
      const eur = EUR('1');
      expect(useUnit(gbp)).not.toBe(useUnit(eur));
    });

    it('should return undefined for nullish value', () => {
      const unit = useUnit(null as never);
      expect(unit).toBeUndefined();
    });

    it('should treat unit[_d] as readonly at the type level', () => {
      const v = GBP('1');
      // @ts-expect-error [_d] is readonly on Unit
      useUnit(v)[_d] = useUnit(v)[_d];
    });
  });
});
