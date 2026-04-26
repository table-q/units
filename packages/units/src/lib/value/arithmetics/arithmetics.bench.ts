import { SCALAR } from 'unit';
import { bench, describe } from 'vitest';

const GBP = SCALAR.clone({ kind: 'GBP', decimals: 2 });

const a = GBP('1537.53');
const b = GBP('249.99');
const aNum = 153753;
const bNum = 24999;
const aBig = 153753n;
const bBig = 24999n;

describe('construction', () => {
  bench('Value from decimal string', () => {
    GBP('1537.53');
  });
  bench('Value from fraction string', () => {
    GBP('1/3');
  });
  bench('Value from integer string', () => {
    GBP('1537');
  });
  bench('native Number()', () => {
    Number('1537.53');
  });
  bench('native BigInt()', () => {
    BigInt('153753');
  });
});

describe('add', () => {
  bench('Value.add(Value)', () => {
    a.add(b);
  });
  bench('Value.add(string)', () => {
    a.add('249.99');
  });
  bench('native number +', () => {
    void (aNum + bNum);
  });
  bench('native bigint +', () => {
    void (aBig + bBig);
  });
});

describe('sub', () => {
  bench('Value.sub(Value)', () => {
    a.sub(b);
  });
  bench('Value.sub(string)', () => {
    a.sub('249.99');
  });
  bench('native number -', () => {
    void (aNum - bNum);
  });
  bench('native bigint -', () => {
    void (aBig - bBig);
  });
});

describe('mul', () => {
  bench('Value.mul(string)', () => {
    a.mul('1.5');
  });
  bench('Value.mul(Scalar)', () => {
    a.mul(SCALAR('1.5'));
  });
  bench('native number *', () => {
    void (aNum * 15);
  });
  bench('native bigint *', () => {
    void (aBig * 15n);
  });
});

describe('div', () => {
  bench('Value.div(string)', () => {
    a.div('3');
  });
  bench('Value.div(same-kind) → Scalar', () => {
    a.div(b);
  });
  bench('native number /', () => {
    void (aNum / bNum);
  });
  bench('native bigint /', () => {
    void (aBig / bBig);
  });
});

describe('mod', () => {
  bench('Value.mod(string)', () => {
    a.mod('3');
  });
  bench('native number %', () => {
    void (aNum % 3);
  });
  bench('native bigint %', () => {
    void (aBig % 3n);
  });
});

describe('pow', () => {
  bench('Value.pow(3)', () => {
    a.pow(3);
  });
  bench('native number **', () => {
    void (aNum ** 3);
  });
  bench('native bigint **', () => {
    void (aBig ** 3n);
  });
});

describe('percent', () => {
  bench('Value.percent(string)', () => {
    a.percent('21.5');
  });
  bench('native number equivalent', () => {
    void ((aNum * 215) / 10000);
  });
  bench('native bigint equivalent', () => {
    void ((aBig * 215n) / 10000n);
  });
});

describe('cmp', () => {
  bench('Value.cmp(Value)', () => {
    a.cmp(b);
  });
  bench('Value.eq(string)', () => {
    a.eq('1537.53');
  });
  bench('Value.gt(string)', () => {
    a.gt('1537.53');
  });
  bench('native number compare', () => {
    void (aNum > bNum);
  });
  bench('native bigint compare', () => {
    void (aBig > bBig);
  });
});

describe('min / max', () => {
  bench('Value.min(Value)', () => {
    a.min(b);
  });
  bench('Value.max(Value)', () => {
    a.max(b);
  });
  bench('native Math.min', () => {
    Math.min(aNum, bNum);
  });
  bench('native Math.max', () => {
    Math.max(aNum, bNum);
  });
});

describe('abs', () => {
  const neg = GBP('-1537.53');
  bench('Value.abs()', () => {
    neg.abs();
  });
  bench('native Math.abs', () => {
    Math.abs(-aNum);
  });
  bench('native bigint abs', () => {
    void (aBig < 0n ? -aBig : aBig);
  });
});

describe('clone / normalize', () => {
  bench('Value.clone()', () => {
    a.clone();
  });
  bench('Value.normalize()', () => {
    a.clone().normalize();
  });
});

describe('scale / convert', () => {
  const EUR = SCALAR.clone({ kind: 'EUR', decimals: 2 });
  bench('Value.scale(4)', () => {
    a.scale(4);
  });
  bench('Value.convert(EUR, rate)', () => {
    a.convert(EUR, '1.17');
  });
  bench('Value.toScalar()', () => {
    a.toScalar();
  });
});

describe('rounding', () => {
  const unrounded = GBP('1').mul('1537.525');
  bench('Value.round(ROUND_HALF_UP)', () => {
    unrounded.round('ROUND_HALF_UP');
  });
  bench('Value.round(ROUND_DOWN)', () => {
    unrounded.round('ROUND_DOWN');
  });
  bench('Value.roundToInt(ROUND_HALF_UP)', () => {
    unrounded.roundToInt('ROUND_HALF_UP');
  });
  bench('native Math.round', () => {
    Math.round(1537.525 * 100) / 100;
  });
});

describe('format', () => {
  bench('Value.toDecimal()', () => {
    a.toDecimal();
  });
  bench('Value.toFraction()', () => {
    a.toFraction();
  });
  bench('Value.toBigInt()', () => {
    a.toBigInt();
  });
  bench('Value.toString()', () => {
    a.toString();
  });
  bench('native Number.toFixed(2)', () => {
    (1537.53).toFixed(2);
  });
  bench('native String(bigint)', () => {
    String(aBig);
  });
});

describe('distribute', () => {
  bench('Value.distribute(3)', () => {
    a.distribute(3);
  });
  bench('Value.distribute(7)', () => {
    a.distribute(7);
  });
  bench('native divide + remainder (3 parts)', () => {
    const base = Math.floor(aNum / 3);
    const rem = aNum - base * 3;
    void [base + (rem > 0 ? 1 : 0), base + (rem > 1 ? 1 : 0), base];
  });
});

describe('chained operations', () => {
  bench('Value: add → mul → sub → div → round', () => {
    a.add(b).mul('1.5').sub('100').div('3').round('ROUND_HALF_UP');
  });
  bench('native number equivalent chain', () => {
    Math.round((((aNum + bNum) * 15) / 10 - 10000) / 3);
  });
  bench('native bigint equivalent chain', () => {
    void ((((aBig + bBig) * 15n) / 10n - 10000n) / 3n);
  });
});
