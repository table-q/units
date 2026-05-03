import { calculateTax } from '../tax/calculation';
import { constants } from '../tax/constants/2026-27';

type TaxCase = {
  pay: string;
  cumul: string;
  code: string;
  period: number;
  taxDue: string;
  taxDueYTD: string;
};

function runTaxCases(
  name: string,
  cases: readonly TaxCase[],
  frequency: 'weekly' | 'monthly',
  mode: 'cumulative' | 'w1m1' = 'cumulative',
) {
  describe(name, () => {
    cases.forEach((c, i) => {
      it(`period ${c.period} (${c.code}): cum=${c.cumul} → taxDue=${c.taxDue}`, () => {
        const prevYTD = mode === 'w1m1' || i === 0 ? '0.00' : cases[i - 1].taxDueYTD;
        const res = calculateTax(c.code, constants, c.cumul, c.period, frequency, prevYTD);
        expect(res.taxDueYTD).toBeUnit(c.taxDueYTD);
        expect(res.taxDue).toBeUnit(c.taxDue);
      });
    });
  });
}

// Regulatory-max test (HMRC doesn't publish reference data for this).
const mCapMonthlyCases: readonly TaxCase[] = [
  {
    pay: '1000.00',
    cumul: '1000.00',
    code: 'K2000',
    period: 1,
    taxDue: '500.00',
    taxDueYTD: '500.00',
  },
  {
    pay: '1000.00',
    cumul: '2000.00',
    code: 'K2000',
    period: 2,
    taxDue: '500.00',
    taxDueYTD: '1000.00',
  },
  {
    pay: '1000.00',
    cumul: '3000.00',
    code: 'K2000',
    period: 3,
    taxDue: '500.00',
    taxDueYTD: '1500.00',
  },
];

runTaxCases('M-cap K2000 monthly', mCapMonthlyCases, 'monthly');
