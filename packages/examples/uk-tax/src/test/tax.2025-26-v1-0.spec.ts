import { join } from 'node:path';
import { calculateTax } from '../tax/calculation';
import { constants } from '../tax/constants/2025-26';
import { loadAllTestData, type Region, runHmrcTraces } from './tax.runner';

const FILES: Record<Region, string> = {
  uk: '2025 - 26 rest of UK tax v1.0.xlsx',
  scottish: '2025 - 26 Scottish tax v1.0.xlsx',
  welsh: '2025- 26 Welsh tax v1.0.xlsx',
};

const DATA_DIR = join(__dirname, '../../test-data/tax/Tax-test-data-examples-from-April-2025-v1-0');

runHmrcTraces('hmrc 2025-26', loadAllTestData(DATA_DIR, FILES), constants, calculateTax);
