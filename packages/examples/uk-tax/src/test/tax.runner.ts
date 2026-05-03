import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { read, utils } from 'xlsx';
import type { calculateTax } from '../tax/calculation';
import type { Constants } from '../tax/constants/constants';

export type Region = 'uk' | 'scottish' | 'welsh';

export type TaxTestRow = {
  sheet: string;
  region: Region;
  payFrequency: string;
  grossPay: string;
  taxablePayToDate: string;
  code: string;
  isW1M1: boolean;
  period: number;
  taxDue: string;
  taxDueToDate: string;
};

export type Override = { taxDueToDate?: string; taxDue?: string };

function toDecimalString(value: number | string): string {
  if (typeof value === 'string') return value;
  const str = value.toFixed(2);
  return str.replace(/^-0\.00$/, '0.00');
}

function parseSheet(rows: unknown[][], sheet: string, region: Region): TaxTestRow[] {
  const result: TaxTestRow[] = [];
  for (let i = 5; i < rows.length; i++) {
    const row = rows[i];
    if (!row[0] || typeof row[0] !== 'string') break;
    result.push({
      sheet,
      region,
      payFrequency: row[0] as string,
      grossPay: toDecimalString(row[1] as number),
      taxablePayToDate: toDecimalString(row[2] as number),
      code: row[3] as string,
      isW1M1: (row[4] as string) === 'WM1',
      period: row[5] as number,
      taxDue: toDecimalString(row[6] as number),
      taxDueToDate: toDecimalString(row[7] as number),
    });
  }
  return result;
}

export function loadTestData(
  dataDir: string,
  files: Record<Region, string>,
  region: Region,
): TaxTestRow[] {
  const buf = readFileSync(join(dataDir, files[region]));
  const wb = read(buf, { type: 'buffer' });
  const rows: TaxTestRow[] = [];
  for (const name of wb.SheetNames) {
    const sheet = wb.Sheets[name];
    const raw = utils.sheet_to_json(sheet, { header: 1, defval: '' }) as unknown[][];
    rows.push(...parseSheet(raw, name, region));
  }
  return rows;
}

export function loadAllTestData(dataDir: string, files: Record<Region, string>): TaxTestRow[] {
  return [
    ...loadTestData(dataDir, files, 'uk'),
    ...loadTestData(dataDir, files, 'scottish'),
    ...loadTestData(dataDir, files, 'welsh'),
  ];
}

export function frequencyOf(payFrequency: string): 'monthly' | 'weekly' {
  return /m(thly|onthly)/i.test(payFrequency) ? 'monthly' : 'weekly';
}

export function runHmrcTraces(
  label: string,
  rows: TaxTestRow[],
  constants: Constants,
  calc: typeof calculateTax,
) {
  const groups = new Map<string, TaxTestRow[]>();
  for (const row of rows) {
    const key = `${row.region}/${row.sheet}`;
    let bucket = groups.get(key);
    if (!bucket) {
      bucket = [];
      groups.set(key, bucket);
    }
    bucket.push(row);
  }

  for (const [key, traceRows] of groups) {
    describe(`${label} ${key}`, () => {
      traceRows.forEach((c, i) => {
        it(`period ${c.period} (${c.code}): cum=${c.taxablePayToDate} → taxDue=${c.taxDue}`, () => {
          const prevRow = traceRows[i - 1];
          const prevYTD = c.isW1M1 || c.period === 1 ? '0.00' : prevRow.taxDueToDate;
          const res = calc(
            c.code,
            constants,
            c.taxablePayToDate,
            c.period,
            frequencyOf(c.payFrequency),
            prevYTD,
          );
          expect(res.taxDueYTD).toBeUnit(c.taxDueToDate);
          expect(res.taxDue).toBeUnit(c.taxDue);
        });
      });
    });
  }
}
