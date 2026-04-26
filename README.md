# Units

Exact-arithmetic financial math using BigInt rationals. No floats, no rounding errors.

## Packages

| Package | npm | Description |
|---|---|---|
| [`@table-q/units`](packages/units) | [![npm](https://img.shields.io/npm/v/@table-q/units)](https://www.npmjs.com/package/@table-q/units) | Core library |
| [`@table-q/units-plugin-bignumber`](packages/units-plugin-bignumber) | [![npm](https://img.shields.io/npm/v/@table-q/units-plugin-bignumber)](https://www.npmjs.com/package/@table-q/units-plugin-bignumber) | BigNumber.js integration |

## Quick Start

```bash
npm install @table-q/units
```

```ts
import { SCALAR } from '@table-q/units';

const GBP = SCALAR.clone({ kind: 'GBP', decimals: 2, signed: true });

GBP('0.10').add('0.20').eq('0.30'); // true — exact arithmetic
GBP('1').div('3').mul('3').eq('1'); // true — no precision loss
```

## Documentation

Full documentation at [table-q.github.io/units](https://table-q.github.io/units/).

## Development

```bash
npm install
npm run bootstrap   # install all package dependencies
npm run ci          # lint + types + tests
npm run build       # build all packages
```

## License

MIT
