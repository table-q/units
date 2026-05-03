---
sidebar_position: 1
---

# @table-q/units

Exact-arithmetic financial math using BigInt rationals.

## Installation

```bash
npm install @table-q/units
```

## Creating Units

Every value belongs to a unit. Create units by cloning `SCALAR`:

```ts
import { SCALAR } from '@table-q/units';

const GBP = SCALAR.clone({ kind: 'GBP', decimals: 2, signed: true });
const EUR = SCALAR.clone({ kind: 'EUR', decimals: 2, signed: true });
const BTC = SCALAR.clone({ kind: 'BTC', decimals: 8, signed: false });
```

## Creating Values

```ts
const price = GBP('19.99');                    // from decimal string (literal)
const half = GBP('1/2');                       // from fraction (literal)
const raw = GBP.fromBigInt(1999n);             // from raw BigInt (1999 = 19.99 with 2 decimals)
```

### Parsing Dynamic Values

Use `.parse()` when accepting runtime values (user input, API responses, database values):

```ts
// Accepts string or number
const userInput: string | number = getUserInput();
const value = GBP.parse(userInput);

// With rounding for lossy conversions
const roundedValue = GBP.parse(userInput, 'ROUND_HALF_UP', 2);

// From API or database
const apiPrice: number = 19.99;
const converted = GBP.parse(apiPrice);

// Contrast with literal constructor (requires string literal at compile time)
const literal = GBP('19.99');  // ✓ works: literal string
const fromVar = GBP(userInput);  // ✗ type error: requires literal string
const viaParser = GBP.parse(userInput);  // ✓ works: parser accepts any string/number
```

## Arithmetic

All operations return new values — nothing is mutated.

```ts
price.add('1.01')       // 21.00
price.sub('9.99')       // 10.00
price.mul('3')          // 59.97
price.div('4')          // 4.9975 (exact rational)
price.percent('20')     // 3.998
price.pow(2)            // 399.6001
price.abs()             // 19.99
price.mod('10')         // 9.99
const [
  quotient,
  remainder
] = price.divmod('4')  // divmod returns [quotient, remainder]
```

## Comparison

```ts
GBP('1').gt('0.99')     // true
GBP('1').eq('1.00')     // true
GBP('1').cmp('2')       // -1 (less), 0 (equal), 1 (greater)
GBP('1').min('2')       // GBP('1.00')
GBP('1').max('2')       // GBP('2.00')
```

## Rounding

Ten rounding modes available:

| Mode | `1.005` | `-1.005` | Behavior |
|---|---|---|---|
| `ROUND_UP` | `1.01` | `-1.01` | Away from zero |
| `ROUND_DOWN` | `1.00` | `-1.00` | Toward zero (truncate) |
| `ROUND_CEIL` | `1.01` | `-1.00` | Toward +infinity |
| `ROUND_FLOOR` | `1.00` | `-1.01` | Toward -infinity |
| `ROUND_HALF_UP` | `1.01` | `-1.01` | Half away from zero |
| `ROUND_HALF_DOWN` | `1.00` | `-1.00` | Half toward zero |
| `ROUND_HALF_EVEN` | `1.00` | `-1.00` | Half to nearest even (banker's) |
| `ROUND_HALF_CEIL` | `1.01` | `-1.00` | Half toward +infinity |
| `ROUND_HALF_FLOOR` | `1.00` | `-1.01` | Half toward -infinity |
| `ROUND_THROW` | throws | throws | Rejects inexact results |

```ts
GBP('1.005').round('ROUND_HALF_UP')    // 1.01
GBP('1.005').round('ROUND_HALF_EVEN')  // 1.00 (banker's rounding)
GBP('1.005').round('ROUND_THROW')      // throws IMPRECISE_CONVERSION
```

## Type Safety

The type system prevents mixing incompatible units at compile time:

```ts
GBP('1').add(EUR('1'))           // Type error: GBP + EUR
UNSIGNED('1').sub(SIGNED('-1'))  // Type error: signed into unsigned
```

## Conversion

```ts
GBP('100').convert(EUR, '1.17')   // EUR('117.00')
GBP('3.50').toScalar()            // SCALAR('7/2')
GBP('100').convert(EUR, '1.17', 'ROUND_HALF_UP')  // with rounding
```

## Distribution

Split a value into equal parts with exact remainder handling:

```ts
GBP('10').distribute(3)
// [GBP('3.34'), GBP('3.33'), GBP('3.33')]
// Sum is exactly 10.00
```

## Formatting

```ts
price.toDecimal()      // '19.99'
price.toFraction()     // '1999/1'
price.toBigInt()       // '1999'
price.format()         // uses custom formatter if configured
```
