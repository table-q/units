# @table-q/units-plugin-bignumber

BigNumber.js integration for `@table-q/units`. Escape to BigNumber for operations like `sqrt`, `log`, and arbitrary-precision division, then return to the exact-rational `Value` type.

## Install

```bash
npm install @table-q/units @table-q/units-plugin-bignumber
```

## Usage

```ts
import { SCALAR } from '@table-q/units';
import '@table-q/units-plugin-bignumber';

const GBP = SCALAR.clone({ kind: 'GBP', decimals: 2, signed: true });

// Square root via BigNumber
GBP('9').bignumber(n => n.sqrt()); // GBP('3.00')

// With BigNumber config
GBP('10').bignumber(n => n.dividedBy(3), { DECIMAL_PLACES: 4 }); // GBP('3.3333')

// Chains with Value ops
GBP('16').bignumber(n => n.sqrt()).add('1'); // GBP('5.00')
```

## Peer Dependencies

- `@table-q/units` ^1.0.0
