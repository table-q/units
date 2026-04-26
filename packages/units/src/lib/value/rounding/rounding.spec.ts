import { SCALAR } from 'unit';
import { Errors } from 'util/errors';

const GBP = SCALAR.clone({
  kind: 'GBP',
  decimals: 2,
});

describe('round()', () => {
  it('should round to the specified decimal place', () => {
    expect(GBP('1537.525', 'ROUND_HALF_CEIL', 0)).toBeUnit('1537.53');
    expect(GBP('-1537.525', 'ROUND_HALF_CEIL', 0)).toBeUnit('-1537.52');
    expect(GBP('1537.525', 'ROUND_HALF_CEIL', 1)).toBeUnit('1537.50');
    expect(GBP('-1537.525', 'ROUND_HALF_CEIL', 1)).toBeUnit('-1537.50');
    expect(GBP('1537.525', 'ROUND_HALF_CEIL', 2)).toBeUnit('1538.00');
    expect(GBP('-1537.525', 'ROUND_HALF_CEIL', 2)).toBeUnit('-1538.00');
    expect(GBP('1537.525', 'ROUND_HALF_CEIL', 3)).toBeUnit('1540.00');
    expect(GBP('-1537.525', 'ROUND_HALF_CEIL', 3)).toBeUnit('-1540.00');
    expect(GBP('1537.525', 'ROUND_HALF_CEIL', 4)).toBeUnit('1500.00');
    expect(GBP('-1537.525', 'ROUND_HALF_CEIL', 4)).toBeUnit('-1500.00');
    expect(GBP('1537.525', 'ROUND_HALF_CEIL', 5)).toBeUnit('2000.00');
    expect(GBP('-1537.525', 'ROUND_HALF_CEIL', 5)).toBeUnit('-2000.00');
    expect(GBP('1537.525', 'ROUND_HALF_CEIL', 6)).toBeUnit('0.00');
    expect(GBP('-1537.525', 'ROUND_HALF_CEIL', 6)).toBeUnit('-0.00');
  });
  it('should round with ROUND_DOWN mode', () => {
    expect(GBP('1.001', 'ROUND_DOWN')).toBeUnit('1.00');
    expect(GBP('-1.001', 'ROUND_DOWN')).toBeUnit('-1.00');
  });
  it('should round with ROUND_UP mode', () => {
    expect(GBP('1.001', 'ROUND_UP')).toBeUnit('1.01');
    expect(GBP('-1.001', 'ROUND_UP')).toBeUnit('-1.01');
  });
  it('should round with ROUND_FLOOR mode', () => {
    expect(GBP('1.001', 'ROUND_FLOOR')).toBeUnit('1.00');
    expect(GBP('-1.001', 'ROUND_FLOOR')).toBeUnit('-1.01');
  });
  it('should round with ROUND_CEIL mode', () => {
    expect(GBP('1.001', 'ROUND_CEIL')).toBeUnit('1.01');
    expect(GBP('-1.001', 'ROUND_CEIL')).toBeUnit('-1.00');
  });
  it('should round with ROUND_HALF_DOWN mode', () => {
    expect(GBP('1.004', 'ROUND_HALF_DOWN')).toBeUnit('1.00');
    expect(GBP('-1.004', 'ROUND_HALF_DOWN')).toBeUnit('-1.00');
    expect(GBP('1.005', 'ROUND_HALF_DOWN')).toBeUnit('1.00');
    expect(GBP('-1.005', 'ROUND_HALF_DOWN')).toBeUnit('-1.00');
    expect(GBP('1.006', 'ROUND_HALF_DOWN')).toBeUnit('1.01');
    expect(GBP('-1.006', 'ROUND_HALF_DOWN')).toBeUnit('-1.01');
  });
  it('should round with ROUND_HALF_UP mode', () => {
    expect(GBP('1.004', 'ROUND_HALF_UP')).toBeUnit('1.00');
    expect(GBP('-1.004', 'ROUND_HALF_UP')).toBeUnit('-1.00');
    expect(GBP('1.005', 'ROUND_HALF_UP')).toBeUnit('1.01');
    expect(GBP('-1.005', 'ROUND_HALF_UP')).toBeUnit('-1.01');
    expect(GBP('1.006', 'ROUND_HALF_UP')).toBeUnit('1.01');
    expect(GBP('-1.006', 'ROUND_HALF_UP')).toBeUnit('-1.01');
  });
  it('should round with ROUND_HALF_CEIL mode', () => {
    expect(GBP('1.004', 'ROUND_HALF_CEIL')).toBeUnit('1.00');
    expect(GBP('-1.004', 'ROUND_HALF_CEIL')).toBeUnit('-1.00');
    expect(GBP('1.005', 'ROUND_HALF_CEIL')).toBeUnit('1.01');
    expect(GBP('-1.005', 'ROUND_HALF_CEIL')).toBeUnit('-1.00');
    expect(GBP('1.006', 'ROUND_HALF_CEIL')).toBeUnit('1.01');
    expect(GBP('-1.006', 'ROUND_HALF_CEIL')).toBeUnit('-1.01');
  });
  it('should round with ROUND_HALF_FLOOR mode', () => {
    expect(GBP('1.004', 'ROUND_HALF_FLOOR')).toBeUnit('1.00');
    expect(GBP('-1.004', 'ROUND_HALF_FLOOR')).toBeUnit('-1.00');
    expect(GBP('1.005', 'ROUND_HALF_FLOOR')).toBeUnit('1.00');
    expect(GBP('-1.005', 'ROUND_HALF_FLOOR')).toBeUnit('-1.01');
    expect(GBP('1.006', 'ROUND_HALF_FLOOR')).toBeUnit('1.01');
    expect(GBP('-1.006', 'ROUND_HALF_FLOOR')).toBeUnit('-1.01');
  });
  it('should round with ROUND_HALF_EVEN mode', () => {
    expect(GBP('1.004', 'ROUND_HALF_EVEN')).toBeUnit('1.00');
    expect(GBP('-1.004', 'ROUND_HALF_EVEN')).toBeUnit('-1.00');
    expect(GBP('1.005', 'ROUND_HALF_EVEN')).toBeUnit('1.00');
    expect(GBP('-1.005', 'ROUND_HALF_EVEN')).toBeUnit('-1.00');
    expect(GBP('1.006', 'ROUND_HALF_EVEN')).toBeUnit('1.01');
    expect(GBP('-1.006', 'ROUND_HALF_EVEN')).toBeUnit('-1.01');
    // Even
    expect(GBP('-1.015', 'ROUND_HALF_EVEN')).toBeUnit('-1.02');
    expect(GBP('1.015', 'ROUND_HALF_EVEN')).toBeUnit('1.02');
    // Odd
    expect(GBP('-1.025', 'ROUND_HALF_EVEN')).toBeUnit('-1.02');
    expect(GBP('1.025', 'ROUND_HALF_EVEN')).toBeUnit('1.02');
  });
  it('should round with ROUND_THROW mode', () => {
    expect(() => GBP('1.004', 'ROUND_THROW')).toThrow(Errors.IMPRECISE_CONVERSION());
  });
  it('should throw on unsupported rounding mode or invalid decimal places', () => {
    expect(() => GBP('1.00', 'SOMETHING' as never)).toThrow(
      Errors.UNSUPPORTED_ROUNDING_MODE('SOMETHING'),
    );
    expect(() => GBP('1.00', 'ROUND_HALF_CEIL', -1)).toThrow(
      Errors.INVALID_TYPE('roundingDecimalPlaces', 'positive integer'),
    );
  });
});

describe('round() precision overflow', () => {
  const PRECISE = SCALAR.clone({
    kind: 'GBP',
    decimals: 2,
    precision: 4,
  });

  it('should throw OVERFLOW for positive precision overflow', () => {
    expect(() => PRECISE('100.00').toDecimal()).toThrow(Errors.OVERFLOW());
  });

  it('should throw UNDERFLOW for negative precision overflow', () => {
    expect(() => PRECISE('-100.00').toDecimal()).toThrow(Errors.UNDERFLOW());
  });
});

describe('round() decimalPlaces constraint', () => {
  const PRECISE = SCALAR.clone({
    kind: 'GBP',
    decimals: 2,
    precision: 4,
  });

  it('should allow decimalPlaces at precision boundary', () => {
    expect(PRECISE('10.24').round('ROUND_DOWN', 4).toDecimal()).toBe('0.00');
  });

  it('should throw when decimalPlaces exceeds precision', () => {
    expect(() => PRECISE('10.24').round('ROUND_DOWN', 5)).toThrow(
      Errors.INVALID_TYPE('roundingDecimalPlaces', '<= 4 (precision)'),
    );
  });

  it('should have no constraint for unbounded precision', () => {
    expect(GBP('1537.525', 'ROUND_HALF_CEIL', 6)).toBeUnit('0.00');
  });

  it('should keep roundToInt on precision-bounded unit within bounds', () => {
    expect(PRECISE('10.24').roundToInt('ROUND_DOWN').toDecimal()).toBe('10.00');
  });

  it('should apply constraint via constructor-time rounding', () => {
    expect(() => PRECISE('10.24', 'ROUND_DOWN', 5)).toThrow(
      Errors.INVALID_TYPE('roundingDecimalPlaces', '<= 4 (precision)'),
    );
  });

  it('should apply constraint via format methods', () => {
    expect(() => PRECISE('10.24').toDecimal('ROUND_DOWN', 5)).toThrow(
      Errors.INVALID_TYPE('roundingDecimalPlaces', '<= 4 (precision)'),
    );
    expect(() => PRECISE('10.24').toBigInt('ROUND_DOWN', 5)).toThrow(
      Errors.INVALID_TYPE('roundingDecimalPlaces', '<= 4 (precision)'),
    );
  });
});

describe('round() bitsize overflow', () => {
  const BOUNDED = SCALAR.clone({
    kind: 'GBP',
    decimals: 2,
    signed: true,
    bitsize: 32,
  });

  it('should throw OVERFLOW when exceeding maxBigInt', () => {
    expect(() => BOUNDED.fromBigInt('2147483648').toDecimal()).toThrow(Errors.OVERFLOW());
  });

  it('should throw UNDERFLOW when exceeding minBigInt', () => {
    expect(() => BOUNDED.fromBigInt('-2147483649').toDecimal()).toThrow(Errors.UNDERFLOW());
  });
});

describe('roundToInt()', () => {
  it('should round to an integer', () => {
    expect(GBP('1').mul('1537.525').roundToInt('ROUND_HALF_CEIL')).toBeUnit('1538');
    expect(GBP('1').mul('-1537.525').roundToInt('ROUND_HALF_CEIL')).toBeUnit('-1538');
  });
  it('should throw on unsupported rounding mode', () => {
    expect(() => GBP('1.00').roundToInt('SOMETHING' as never)).toThrow(
      Errors.UNSUPPORTED_ROUNDING_MODE('SOMETHING'),
    );
  });
});

describe('round() constraints', () => {
  it('should not throw when constraint passes', () => {
    const POSITIVE = SCALAR.clone({
      kind: 'GBP',
      decimals: 0,
      constraints: [
        (v) => {
          if (v.isNegative()) throw Errors.INVALID_TYPE('value', 'positive');
        },
      ],
    });
    expect(POSITIVE('5').round('ROUND_DOWN')).toBeUnit('5');
  });

  it('should throw when constraint fails', () => {
    const EVEN = SCALAR.clone({
      kind: 'GBP',
      decimals: 0,
      constraints: [
        (v) => {
          if (BigInt(v.toFraction().split('/')[0]) % 2n !== 0n) {
            throw Errors.INVALID_TYPE('value', 'even');
          }
        },
      ],
    });
    expect(EVEN('4').round('ROUND_DOWN')).toBeUnit('4');
    expect(() => EVEN('2.5').round('ROUND_UP')).toThrow(Errors.INVALID_TYPE('value', 'even'));
    expect(EVEN('2.5').round('ROUND_DOWN')).toBeUnit('2');
  });

  it('should run all constraints', () => {
    const calls: string[] = [];
    const MULTI = SCALAR.clone({
      kind: 'GBP',
      decimals: 0,
      constraints: [
        () => {
          calls.push('a');
        },
        () => {
          calls.push('b');
        },
      ],
    });
    MULTI('1').round('ROUND_DOWN');
    expect(calls).toEqual(['a', 'b']);
  });

  it('should stop execution at the first failing constraint', () => {
    const calls: string[] = [];
    const MULTI = SCALAR.clone({
      kind: 'GBP',
      decimals: 0,
      constraints: [
        () => {
          calls.push('a');
          throw Errors.INVALID_TYPE('value', 'first');
        },
        () => {
          calls.push('b');
        },
      ],
    });
    expect(() => MULTI('1').round('ROUND_DOWN')).toThrow(Errors.INVALID_TYPE('value', 'first'));
    expect(calls).toEqual(['a']);
  });

  it('should skip checks when no constraints field is present', () => {
    expect(GBP('1.005').round('ROUND_UP')).toBeUnit('1.01');
  });

  it('should skip checks when constraints array is empty', () => {
    const EMPTY = SCALAR.clone({
      kind: 'GBP',
      decimals: 2,
      constraints: [],
    });
    expect(EMPTY('1.005').round('ROUND_UP')).toBeUnit('1.01');
  });

  it('should receive the rounded value in the constraint callback', () => {
    let received: string | undefined;
    const SPY = SCALAR.clone({
      kind: 'GBP',
      decimals: 0,
      constraints: [
        (v) => {
          received = v.toFraction();
        },
      ],
    });
    SPY('1.5').round('ROUND_UP');
    expect(received).toBe('2/1');
  });

  it('should apply constraints via constructor-time rounding', () => {
    const NO_NEGATIVE = SCALAR.clone({
      kind: 'GBP',
      decimals: 2,
      constraints: [
        (v) => {
          if (v.isNegative()) throw Errors.INVALID_CONVERSION('negative', 'positive');
        },
      ],
    });
    expect(NO_NEGATIVE('1.005', 'ROUND_UP')).toBeUnit('1.01');
    expect(() => NO_NEGATIVE('-1.005', 'ROUND_UP')).toThrow(
      Errors.INVALID_CONVERSION('negative', 'positive'),
    );
  });

  it('should apply constraints via format methods', () => {
    const NO_NEGATIVE = SCALAR.clone({
      kind: 'GBP',
      decimals: 2,
      constraints: [
        (v) => {
          if (v.isNegative()) throw Errors.INVALID_CONVERSION('negative', 'positive');
        },
      ],
    });
    expect(NO_NEGATIVE('1.00').toDecimal('ROUND_DOWN')).toBe('1.00');
    expect(() => NO_NEGATIVE('-1.00').toDecimal('ROUND_DOWN')).toThrow(
      Errors.INVALID_CONVERSION('negative', 'positive'),
    );
  });

  it('should have typed Value with kind in constraint callback', () => {
    SCALAR.clone({
      kind: 'GBP',
      decimals: 2,
      constraints: [
        (v) => {
          const k: 'GBP' = v.kind();
          void k;
        },
      ],
    });
  });

  it('should reject wrong kind at the type level in constraint callback', () => {
    SCALAR.clone({
      kind: 'GBP',
      decimals: 2,
      constraints: [
        (v) => {
          // @ts-expect-error kind is 'GBP', not 'EUR'
          const k: 'EUR' = v.kind();
          void k;
        },
      ],
    });
  });
});
