import { SCALAR } from '@table-q/units';
import '@table-q/units-plugin-bignumber';

const GBP = SCALAR.clone({ kind: 'GBP', decimals: 2, signed: true });
const EUR = SCALAR.clone({ kind: 'EUR', decimals: 2, signed: true });

describe('basic arithmetic', () => {
  test('add', () => {
    expect(GBP('1.50').add('2.30')).toBeUnit('3.80');
  });

  test('sub', () => {
    expect(GBP('10.00').sub('3.50')).toBeUnit('6.50');
  });

  test('mul', () => {
    expect(GBP('5.00').mul('3')).toBeUnit('15.00');
  });

  test('div', () => {
    expect(GBP('10.00').div('4')).toBeUnit('2.50');
  });

  test('exact fractions', () => {
    expect(GBP('1').div('3').mul('3')).toBeUnit('1.00');
  });
});

describe('comparison', () => {
  test('min and max', () => {
    expect(GBP('1').min('2')).toBeUnit('1.00');
    expect(GBP('1').max('2')).toBeUnit('2.00');
  });
});

describe('conversion', () => {
  test('GBP to EUR', () => {
    expect(GBP('100').convert(EUR, '1.17')).toBeUnit('117.00');
  });

  test('toScalar', () => {
    const s = GBP('3.50').toScalar();
    expect(s.kind()).toBe('SCALAR');
    expect(s).toBeUnit('7/2');
  });
});

describe('bignumber plugin', () => {
  test('sqrt', () => {
    expect(GBP('9').bignumber((n) => n.sqrt())).toBeUnit('3.00');
  });

  test('power', () => {
    expect(GBP('2').bignumber((n) => n.pow(10))).toBeUnit('1024.00');
  });

  test('chains with Value ops', () => {
    expect(
      GBP('16')
        .bignumber((n) => n.sqrt())
        .add('1'),
    ).toBeUnit('5.00');
  });
});
