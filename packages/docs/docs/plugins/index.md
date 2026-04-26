---
sidebar_position: 1
---

# Plugins

The `@table-q/units` library supports plugins that extend the `Value` type with new methods.

## How Plugins Work

Plugins use two mechanisms:

1. **`declare module '@table-q/units'`** — adds the method signature to the `Value` interface at the type level
2. **`extend(proto => { ... })`** — attaches the implementation to the shared prototype at runtime

```ts
import { extend } from '@table-q/units';

// 1. Declare the type
declare module '@table-q/units' {
  interface Value<Signed, U, Decimals> {
    double(): Value<Signed, U, Decimals>;
  }
}

// 2. Attach the implementation
extend((proto) => {
  proto.double = function () {
    return this.mul('2');
  };
});
```

## Using a Plugin

Import the plugin for its side effect — the import triggers the `extend()` call:

```ts
import '@table-q/units-plugin-bignumber';
```

After this import, all `Value` instances have the plugin's methods available.

## Available Plugins

| Plugin | Description |
|---|---|
| [`@table-q/units-plugin-bignumber`](bignumber) | BigNumber.js integration for sqrt, log, arbitrary-precision division |
