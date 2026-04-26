---
sidebar_position: 1
---

# @table-q/units-plugin-bignumber

BigNumber.js integration for `@table-q/units`. Escape to BigNumber for operations not available in exact-rational arithmetic, then return to the `Value` type.

## Installation

```bash
npm install @table-q/units @table-q/units-plugin-bignumber
```

## Usage

```ts
import { SCALAR } from '@table-q/units';
import '@table-q/units-plugin-bignumber';

const GBP = SCALAR.clone({ kind: 'GBP', decimals: 2, signed: true });

// Square root
GBP('9').bignumber(n => n.sqrt());  // GBP('3.00')

// Power
GBP('2').bignumber(n => n.pow(10)); // GBP('1024.00')

// Chain with Value ops
GBP('16').bignumber(n => n.sqrt()).add('1'); // GBP('5.00')
```

## BigNumber Config

Pass a BigNumber configuration as the second argument:

```ts
GBP('10').bignumber(
  n => n.dividedBy(3),
  { DECIMAL_PLACES: 4, ROUNDING_MODE: 1 }
); // GBP('3.3333')
```

The config creates an isolated BigNumber constructor — it does not affect the global BigNumber settings.

## How It Works

1. The value's exact fraction is extracted via `toFraction()`
2. A `BigNumber` is constructed from the numerator and denominator
3. Your callback transforms the BigNumber
4. The result is converted back to a fraction and wrapped in a new `Value` of the same unit

This means precision is limited by BigNumber's configuration during the callback, but the result re-enters the exact-rational system immediately.
