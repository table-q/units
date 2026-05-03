import { SCALAR, type ValueOf } from '@table-q/units';

export const Bandwith = SCALAR.clone({
  kind: 'GBP',
  decimals: 0,
  signed: false,
  constraints: [(value) => value.lte('999999')],
});

export type Bandwith = ValueOf<typeof Bandwith>;

export const TaxRate = SCALAR.clone({
  kind: 'TAX_RATE',
  decimals: 2,
  signed: false,
  constraints: [(value) => value.lte('99.99')],
});

export type TaxRate = ValueOf<typeof TaxRate>;

export const TaxAmount = SCALAR.clone({
  kind: 'GBP',
  decimals: 2,
  signed: false,
  constraints: [(value) => value.lte('99999999.99')],
});

export type TaxAmount = ValueOf<typeof TaxAmount>;

export type TaxBase = {
  B: Bandwith[];
  R: TaxRate[];
  G: number;
  M: TaxRate;
};

export type TaxCalculated = {
  C: Bandwith[];
  K: TaxAmount[];
};

export type ConstantsBase = {
  DEFAULT: TaxBase;
  SCOTLAND: TaxBase;
  WALES: TaxBase;
};

export type Constants = ConstantsBase & {
  DEFAULT: TaxCalculated;
  SCOTLAND: TaxCalculated;
  WALES: TaxCalculated;
};

function calculateTaxConstant(base: TaxBase): TaxCalculated {
  const bValues = base.B;
  const rValues = base.R;
  const cValues = [] as Bandwith[];
  const kValues = [] as TaxAmount[];
  for (let i = 0; i < bValues.length; i += 1) {
    const bValue = bValues[i];
    const rValue = rValues[i];
    const prevCValue = cValues[i - 1] ?? Bandwith('0');
    const prevKValue = kValues[i - 1] ?? TaxAmount('0');
    cValues.push(prevCValue.add(bValue));
    kValues.push(
      prevKValue.add(bValue.convert(TaxAmount, rValue.div('100').toScalar()).round('ROUND_DOWN')),
    );
  }
  return {
    C: cValues,
    K: kValues,
  };
}

export function calculateConstants(base: ConstantsBase): Constants {
  return {
    DEFAULT: {
      ...base.DEFAULT,
      ...calculateTaxConstant(base.DEFAULT),
    },
    SCOTLAND: {
      ...base.SCOTLAND,
      ...calculateTaxConstant(base.SCOTLAND),
    },
    WALES: {
      ...base.WALES,
      ...calculateTaxConstant(base.WALES),
    },
  };
}
