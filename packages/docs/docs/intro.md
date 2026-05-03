---
sidebar_position: 1
---

# Introduction

**Units** is a TypeScript library family for exact-arithmetic financial calculations using BigInt rationals.

Every number is stored as a `numerator / denominator` pair of BigInts — no floats, no rounding errors, no silent precision loss.

## Why?

```ts
// JavaScript floats
0.1 + 0.2 === 0.3 // false

// @table-q/units
GBP('0.10').add('0.20').eq('0.30') // true
```

Financial software cannot tolerate floating-point errors. `@table-q/units` eliminates them at the representation level.

## Packages

| Package | Description |
|---|---|
| [`@table-q/units`](units/) | Core library — units, values, arithmetic, rounding |
| [`@table-q/units-plugin-bignumber`](plugins/bignumber/) | BigNumber.js integration for sqrt, log, etc. |

## Examples

- **[simple-math](https://github.com/artit-io/units-temp/tree/main/packages/examples/simple-math)** — Basic arithmetic with units. A starting point for exploring the core API.
- **[uk-tax](https://github.com/artit-io/units-temp/tree/main/packages/examples/uk-tax)** — UK PAYE tax calculation. Demonstrates financial domain-specific logic with HMRC test data.

## Quick Start

```bash
npm install @table-q/units
```

```ts
import { SCALAR } from '@table-q/units';

const GBP = SCALAR.clone({ kind: 'GBP', decimals: 2, signed: false });

const a = GBP('10.50');
const b = GBP('3.25');
console.log(a.add(b).toDecimal()); // '13.75'
console.log(a.div('3').mul('3').eq(a)); // true — exact fractions

// Handling dynamic input
const userAmount: string | number = getUserInput();
const value = GBP.parse(userAmount);
```
