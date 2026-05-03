---
"@table-q/units": patch
---

- Add CommonJS build output via tsup (`format: ['esm', 'cjs']`)
- Add `unit.parse()` method for parsing dynamic string/number inputs with rounding
- `value.convert()` can receive `SCALAR` values
- `value.between()` method