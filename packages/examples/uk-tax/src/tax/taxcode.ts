import { SCALAR, type ValueOf } from '@table-q/units';
import { type Constants, TaxRate } from './constants/constants';

const GBP = SCALAR.clone({
  kind: 'GBP',
  decimals: 2,
  signed: false,
});

const CALC_GBP = SCALAR.clone({
  kind: 'CALC_GBP',
  decimals: 4,
  signed: false,
});

type GBP = ValueOf<typeof GBP>;

export type TaxConfig =
  | {
      type: 'ALLOWANCE';
      scottish: boolean;
      additionalPay: boolean;
      week1: GBP;
      month1: GBP;
      C: Constants['DEFAULT']['C'];
      R: Constants['DEFAULT']['R'];
      K: Constants['DEFAULT']['K'];
      M: TaxRate;
    }
  | {
      type: 'RATE';
      rate: TaxRate;
    };

export function calculateTaxConfig(taxcode: string, constants: Constants): TaxConfig {
  let scottish = false;
  let table = constants.DEFAULT;
  if (taxcode.startsWith('S')) {
    scottish = true;
    table = constants.SCOTLAND;
    taxcode = taxcode.substring(1);
  }
  if (taxcode.startsWith('C')) {
    table = constants.WALES;
    taxcode = taxcode.substring(1);
  }
  const ret = {
    type: 'ALLOWANCE' as const,
    scottish,
    additionalPay: false,
    week1: GBP('0'),
    month1: GBP('0'),
    C: table.C,
    R: table.R,
    K: table.K,
    M: table.M,
  };
  if (taxcode === 'NT') {
    return { type: 'RATE', rate: TaxRate('0') };
  }
  if (taxcode.startsWith('BR')) {
    return { type: 'RATE', rate: table.R[table.G - 1] };
  }
  if (taxcode.startsWith('D0')) {
    return { type: 'RATE', rate: table.R[table.G] };
  }
  if (taxcode.startsWith('D1')) {
    return { type: 'RATE', rate: table.R[table.G + 1] };
  }
  if (taxcode.startsWith('D2')) {
    return { type: 'RATE', rate: table.R[table.G + 2] };
  }
  if (taxcode.startsWith('D3')) {
    return { type: 'RATE', rate: table.R[table.G + 3] };
  }
  if (taxcode.startsWith('K')) {
    ret.additionalPay = true;
  }
  taxcode = taxcode.replaceAll(/[^0-9]/g, '');
  const numeric = SCALAR.parse(taxcode);
  if (numeric.eq('0')) {
    return ret;
  }
  let [quotient, remainder] = numeric.sub('1').divmod('500');

  remainder = remainder.add('1');

  ret.week1 = GBP('96.16').mul(quotient);
  ret.month1 = GBP('416.67').mul(quotient);

  ret.week1 = ret.week1.add(
    CALC_GBP('10')
      .mul(remainder)
      .add('9')
      .div('52')
      .round('ROUND_DOWN')
      .convert(GBP)
      .round('ROUND_UP'),
  );
  ret.month1 = ret.month1.add(
    CALC_GBP('10')
      .mul(remainder)
      .add('9')
      .div('12')
      .round('ROUND_DOWN')
      .convert(GBP)
      .round('ROUND_UP'),
  );

  return ret;
}
