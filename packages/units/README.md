# @table-q/units

Exact-arithmetic financial math using BigInt rationals. No floats, no rounding errors.

## Install

```bash
npm install @table-q/units
```

## Usage

```ts
import { SCALAR } from '@table-q/units';

const GBP = SCALAR.clone({ kind: 'GBP', decimals: 2, signed: true });

const price = GBP('19.99');
const tax = price.percent('20');       // GBP('3.998')
const total = price.add(tax);          // exact rational — no rounding yet
console.log(total.toDecimal('ROUND_HALF_UP')); // '23.99'

// Exact fractions — no precision loss
GBP('1').div('3').mul('3').eq('1'); // true
```

## Features

- **BigInt rationals** — every value is `numerator / denominator`, no floats anywhere
- **Type-safe units** — `GBP + EUR` is a compile-time error
- **Signedness algebra** — unsigned values reject negative results at both type and runtime level
- **10 rounding modes** — UP, DOWN, CEIL, FLOOR, HALF_UP, HALF_DOWN, HALF_EVEN, HALF_CEIL, HALF_FLOOR, THROW
- **Overflow protection** — configurable bitsize and precision constraints
- **Plugin system** — extend `Value` with custom methods via `extend()`
