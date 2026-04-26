import { SCALAR } from 'unit';
import { DATA_SYMBOL as _d } from 'util/helpers';
import { randomInt } from 'util/test-random';
import { createValueInstance, extend } from 'value';
import { GBP, PHP } from 'value/arithmetics/testTypes';

describe('createValueInstance', () => {
  it('should create a value from a decimal string', () => {
    const v = createValueInstance('1.50', GBP.unit, false);
    expect(v.toDecimal()).toBe('1.50');
  });

  it('should create a value from a bigint string', () => {
    const v = createValueInstance('150', GBP.unit, true);
    expect(v.toDecimal()).toBe('1.50');
  });

  it('should store correct internal data for a created value', () => {
    const n = randomInt(2, 99);
    const v = createValueInstance(n, GBP.unit, false);
    expect(v[_d].numerator).toBe(BigInt(n) * 100n);
    expect(v[_d].denominator).toBe(1n);
    expect(v[_d].unit).toBe(GBP.unit);
  });

  it('should expose all prototype methods on a created value', () => {
    const v = createValueInstance('1', GBP.unit, false);
    expect(typeof v.add).toBe('function');
    expect(typeof v.sub).toBe('function');
    expect(typeof v.mul).toBe('function');
    expect(typeof v.div).toBe('function');
    expect(typeof v.clone).toBe('function');
    expect(typeof v.normalize).toBe('function');
    expect(typeof v.round).toBe('function');
    expect(typeof v.toDecimal).toBe('function');
    expect(typeof v.toFraction).toBe('function');
    expect(typeof v.format).toBe('function');
    expect(typeof v.kind).toBe('function');
    expect(typeof v.isInteger).toBe('function');
    expect(typeof v.isNegative).toBe('function');
    expect(typeof v.isSigned).toBe('function');
    expect(typeof v.cmp).toBe('function');
    expect(typeof v.eq).toBe('function');
    expect(typeof v.convert).toBe('function');
    expect(typeof v.scale).toBe('function');
    expect(typeof v.pow).toBe('function');
    expect(typeof v.abs).toBe('function');
    expect(typeof v.mod).toBe('function');
    expect(typeof v.percent).toBe('function');
    expect(typeof v.distribute).toBe('function');
  });

  it('should share the same prototype across values', () => {
    const a = createValueInstance('1', GBP.unit, false);
    const b = createValueInstance('2', GBP.unit, false);
    expect(Object.getPrototypeOf(a)).toBe(Object.getPrototypeOf(b));
  });

  it('should share the same prototype across values from different units', () => {
    const gbp = createValueInstance('1', GBP.unit, false);
    const php = createValueInstance('1', PHP.unit, false);
    expect(Object.getPrototypeOf(gbp)).toBe(Object.getPrototypeOf(php));
  });

  it('should produce functional prototype methods on a created value', () => {
    const n = randomInt(2, 99);
    const num = Number(n);
    const v = createValueInstance(n, GBP.unit, false);
    const addExpected = (num + 2).toFixed(2);
    const subExpected = (num - 1).toFixed(2);
    const mulExpected = (num * 2).toFixed(2);
    expect(v.add('2')).toBeUnit(addExpected);
    expect(v.sub('1')).toBeUnit(subExpected);
    expect(v.mul('2')).toBeUnit(mulExpected);
    expect(v.kind()).toBe('GBP');
    expect(v.decimals()).toBe(2);
  });
});

describe('Value prototype wiring', () => {
  it('should return the kind from Symbol.toStringTag', () => {
    expect(Object.prototype.toString.call(GBP('1'))).toBe('[object GBP]');
    expect(Object.prototype.toString.call(PHP('1'))).toBe('[object PHP]');
  });

  it('should support the nodejs inspect custom symbol', () => {
    const v = GBP('1.50');
    const inspectSymbol = Symbol.for('nodejs.util.inspect.custom');
    // biome-ignore lint/suspicious/noExplicitAny: testing symbol method
    expect((v as any)[inspectSymbol]()).toBe('GBP(1.50)');
  });

  it('should return the decimal representation from toString', () => {
    expect(GBP('1.50').toString()).toBe('1.50');
  });

  it('should return the decimal representation from toJSON', () => {
    expect(GBP('1.50').toJSON()).toBe('1.50');
  });

  it('should handle SCALAR values through createValueInstance', () => {
    const n = randomInt(2, 99);
    const v = createValueInstance(n, SCALAR.unit, false);
    expect(v.toDecimal()).toBe(n);
    expect(v.kind()).toBe('SCALAR');
  });
});

describe('extend()', () => {
  it('should attach a method to the Value prototype', () => {
    let called = false;
    extend((proto) => {
      // biome-ignore lint/suspicious/noExplicitAny: testing extend
      (proto as any)._testExtend = () => {
        called = true;
      };
    });
    // biome-ignore lint/suspicious/noExplicitAny: testing extend
    (GBP('1') as any)._testExtend();
    expect(called).toBe(true);
  });
});
