import { SCALAR, type ValueOf } from '@table-q/units';
import type { Constants } from './constants/constants';
import { calculateTaxConfig } from './taxcode';

export const GBP = SCALAR.clone({
  kind: 'GBP',
  decimals: 2,
  signed: false,
});

export type GBP = ValueOf<typeof GBP>;

const CALC = SCALAR.clone({
  kind: 'CALC',
  decimals: 4,
  signed: false,
});

const GBP_SIGNED = SCALAR.clone({
  kind: 'GBP',
  decimals: 2,
  signed: true,
});

function calculateTaxInternal(
  taxcode: string,
  constants: Constants,
  cumulativePayYTD: GBP,
  period: SCALAR,
  frequency: 'weekly' | 'monthly',
): GBP {
  const frequencyConfig = (
    {
      weekly: {
        allowance: 'week1',
        periods: SCALAR('52'),
      },
      monthly: {
        allowance: 'month1',
        periods: SCALAR('12'),
      },
    } as const
  )[frequency];
  let taxDueYTD = GBP('0');
  // Stage2
  const taxConfig = calculateTaxConfig(taxcode, constants);
  // Stage3
  if (taxConfig.type === 'ALLOWANCE') {
    const freeOrAdditionalPayYTD = taxConfig[frequencyConfig.allowance].mul(period);
    let taxablePayYTD = cumulativePayYTD.add(freeOrAdditionalPayYTD);
    if (!taxConfig.additionalPay) {
      if (cumulativePayYTD.gte(freeOrAdditionalPayYTD)) {
        taxablePayYTD = cumulativePayYTD.sub(freeOrAdditionalPayYTD);
      } else {
        taxablePayYTD = GBP('0');
      }
    }
    let formula = 0;
    for (const c of taxConfig.C) {
      if (taxablePayYTD.lte(c.mul(period).div(frequencyConfig.periods))) {
        break;
      }
      formula += 1;
    }
    taxablePayYTD = taxablePayYTD.roundToInt('ROUND_DOWN');
    if (!taxConfig.scottish) {
      // English/Welsh: K-accumulator shortcut - exact arithmetic, no truncation.
      if (formula > 0) {
        const cBoundary = taxConfig.C[formula - 1].mul(period).div(frequencyConfig.periods);
        const kAccum = taxConfig.K[formula - 1].mul(period).div(frequencyConfig.periods);
        taxDueYTD = taxablePayYTD
          .sub(cBoundary)
          .mul(taxConfig.R[formula].div('100').toScalar())
          .add(kAccum);
      }
    } else {
      // Scottish: piecewise band computation with 4dp truncation at each prorated boundary.
      let tax = CALC('0');
      const taxableCalc = taxablePayYTD.convert(CALC);
      for (let i = 0; i <= formula; i += 1) {
        const lo =
          i === 0
            ? CALC('0')
            : taxConfig.C[i - 1]
                .mul(period)
                .div(frequencyConfig.periods)
                .convert(CALC)
                .round('ROUND_DOWN');
        const hi =
          i < formula
            ? taxConfig.C[i]
                .mul(period)
                .div(frequencyConfig.periods)
                .convert(CALC)
                .round('ROUND_DOWN')
            : taxableCalc;
        if (hi.lte(lo)) {
          continue;
        }
        const bandTax = hi.sub(lo).mul(taxConfig.R[i].div('100').toScalar()).round('ROUND_DOWN');
        tax = tax.add(bandTax);
      }
      taxDueYTD = tax.convert(GBP);
    }
    // Regulatory maximum: total tax to date may never exceed cumulative pay × M / 100.
    const cap = cumulativePayYTD.roundToInt('ROUND_DOWN').mul(taxConfig.M.div('100').toScalar());
    if (taxDueYTD.gt(cap)) {
      taxDueYTD = cap;
    }
  }
  if (taxConfig.type === 'RATE') {
    taxDueYTD = cumulativePayYTD.roundToInt('ROUND_DOWN').mul(taxConfig.rate.div('100').toScalar());
  }
  return taxDueYTD.round('ROUND_DOWN');
}

export type TaxCalculationResult = {
  taxDue: GBP;
  taxDueYTD: GBP;
};

export function calculateTax(
  taxcode: string,
  constants: Constants,
  cumulativePayYTD: string,
  period: number,
  frequency: 'weekly' | 'monthly',
  taxDueYTDPrev: string,
) {
  const _cumulativePayYTD = GBP.parse(cumulativePayYTD).round('ROUND_THROW');
  const _period = SCALAR.parse(period);
  const _taxDueYTDPrev = GBP_SIGNED.parse(taxDueYTDPrev).round('ROUND_THROW');
  const taxDueYTD = calculateTaxInternal(taxcode, constants, _cumulativePayYTD, _period, frequency);
  return {
    taxDue: taxDueYTD.convert(GBP_SIGNED).sub(_taxDueYTDPrev),
    taxDueYTD,
  };
}
