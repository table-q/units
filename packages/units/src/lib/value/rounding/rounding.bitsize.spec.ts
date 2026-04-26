import { SCALAR } from 'unit';
import { Errors } from 'util/errors';

const U_GBP = SCALAR.clone({
  signed: false,
  decimals: 2,
  kind: 'GBP',
});

const U_GBP_64 = U_GBP.clone({
  bitsize: 64,
});

const GBP_32 = U_GBP.clone({
  kind: 'GBP_32',
  signed: true,
  bitsize: 32,
});

const GBP_DOUBLE = GBP_32.clone({
  bitsize: 54,
});

describe('round() context.bitsize tests', () => {
  it('should fit into U64 bits', () => {
    const balance = U_GBP_64('1023.24');
    const result = balance.mul('1/3').add(balance.mul('2/3'));
    expect(result).toBeUnit('1023.24');
    expect(result.percent('21.345').toDecimal('ROUND_DOWN')).toBe('218.41');
  });
  it('should fit into S32 bits', () => {
    const balance = GBP_32('-1023.24');
    const result = balance.mul('1/3').add(balance.mul('2/3'));
    expect(result).toBeUnit('-1023.24');
    expect(result.percent('21.345').toDecimal('ROUND_DOWN')).toBe('-218.41');
  });
  it('should fit into JS Double', () => {
    const balance = GBP_DOUBLE.fromBigInt(-Number.MAX_SAFE_INTEGER);
    const result = balance.mul('1/3').add(balance.mul('2/3'));
    expect(result).toBeUnit(GBP_DOUBLE.fromBigInt(-Number.MAX_SAFE_INTEGER));
    expect(result.percent('21.345').toDecimal('ROUND_DOWN')).toBe('-19225866809244.64');
    expect(() => GBP_DOUBLE.fromBigInt(Number.MAX_SAFE_INTEGER + 1)).toThrow(
      Errors.INVALID_TYPE('value', 'safe integer'),
    );
    expect(() => GBP_DOUBLE.fromBigInt(-Number.MAX_SAFE_INTEGER - 1)).toThrow(
      Errors.INVALID_TYPE('value', 'safe integer'),
    );
  });
  it('should throw UNDERFLOW when exceeding minimum bitsize bounds', () => {
    expect(() => U_GBP_64('-1')).toThrow(Errors.INVALID_CONVERSION('SIGNED', 'UNSIGNED'));
    expect(() => U_GBP_64('1').mul('-1')).toThrow(Errors.INVALID_CONVERSION('SIGNED', 'UNSIGNED'));
    expect(() => GBP_32.fromBigInt('-2147483648').toDecimal()).not.toThrow();
    expect(() => GBP_32.fromBigInt('-2147483649').toDecimal()).toThrow(Errors.UNDERFLOW());
    expect(() => GBP_DOUBLE.fromBigInt('-9007199254740992').toDecimal()).not.toThrow();
    expect(() => GBP_DOUBLE.fromBigInt('-9007199254740993').toDecimal()).toThrow(
      Errors.UNDERFLOW(),
    );
  });
  it('should throw OVERFLOW when exceeding maximum bitsize bounds', () => {
    expect(() => U_GBP_64.fromBigInt('18446744073709551615').toDecimal()).not.toThrow();
    expect(() => U_GBP_64.fromBigInt('18446744073709551616').toDecimal()).toThrow(
      Errors.OVERFLOW(),
    );
    expect(() => GBP_32.fromBigInt('2147483647').toDecimal()).not.toThrow();
    expect(() => GBP_32.fromBigInt('2147483648').toDecimal()).toThrow(Errors.OVERFLOW());
    expect(() => GBP_DOUBLE.fromBigInt('9007199254740991').toDecimal()).not.toThrow();
    expect(() => GBP_DOUBLE.fromBigInt('9007199254740992').toDecimal()).toThrow(Errors.OVERFLOW());
  });
});
