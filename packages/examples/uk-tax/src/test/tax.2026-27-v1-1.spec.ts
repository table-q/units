import { join } from 'node:path';
import { calculateTax } from '../tax/calculation';
import { constants } from '../tax/constants/2026-27';
import {
  loadAllTestData,
  loadTestData,
  type Region,
  runHmrcTraces,
  type TaxTestRow,
} from './tax.runner';

const FILES: Record<Region, string> = {
  uk: '2026 - 27 rest of UK tax v1.0.xlsx',
  scottish: '2026 - 27 Scottish tax v1.1.xlsx',
  welsh: '2026- 27 Welsh tax v1.0.xlsx',
};

const DATA_DIR = join(__dirname, '../../test-data/tax/Tax-test-data-examples-2026-27-v1-1');

function load(region: Region) {
  return loadTestData(DATA_DIR, FILES, region);
}

function loadAll() {
  return loadAllTestData(DATA_DIR, FILES);
}

describe('parse-hmrc-test-data', () => {
  test('loads UK test data', () => {
    const rows = load('uk');
    expect(rows.length).toBe(64);
    expect(rows[0]).toEqual<TaxTestRow>({
      sheet: 'Gen_cumul-mthly',
      region: 'uk',
      payFrequency: 'Gen_cumul_mthly',
      grossPay: '1156.25',
      taxablePayToDate: '1156.25',
      code: '1257L',
      isW1M1: false,
      period: 1,
      taxDue: '21.40',
      taxDueToDate: '21.40',
    });
  });

  test('loads Scottish test data', () => {
    expect(load('scottish').length).toBe(64);
  });

  test('loads Welsh test data', () => {
    expect(load('welsh').length).toBe(40);
  });

  test('loads all test data', () => {
    expect(loadAll().length).toBe(168);
  });

  test('parses W1/M1 flag', () => {
    const rows = load('uk');
    expect(rows.find((r) => r.sheet === 'Gen_cumul-mthly')?.isW1M1).toBe(false);
    expect(rows.find((r) => r.sheet === 'Gen_W1M1_mthly')?.isW1M1).toBe(true);
  });

  test('parses K codes', () => {
    const kRows = load('uk').filter((r) => r.code.startsWith('K'));
    expect(kRows.length).toBeGreaterThan(0);
    expect(kRows[0].code).toBe('K585');
  });

  test('parses Scottish K codes with S prefix', () => {
    const skRows = load('scottish').filter((r) => r.code.startsWith('SK'));
    expect(skRows.length).toBeGreaterThan(0);
    expect(skRows[0].code).toBe('SK585');
  });

  test('decimal formatting is consistent', () => {
    for (const row of loadAll()) {
      expect(row.grossPay).toMatch(/^-?\d+\.\d{2}$/);
      expect(row.taxablePayToDate).toMatch(/^-?\d+\.\d{2}$/);
      expect(row.taxDue).toMatch(/^-?\d+\.\d{2}$/);
      expect(row.taxDueToDate).toMatch(/^-?\d+\.\d{2}$/);
    }
  });
});

runHmrcTraces('hmrc 2026-27', loadAll(), constants, calculateTax);
