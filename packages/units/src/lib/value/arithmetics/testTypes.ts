import { SCALAR } from 'unit';

export const GBP = SCALAR.clone({
  kind: 'GBP',
  decimals: 2,
});

export const PRECISE_GBP = SCALAR.clone({
  kind: 'GBP',
  decimals: 4,
});

export const UNSIGNED_GBP = SCALAR.clone({
  kind: 'GBP',
  decimals: 0,
  signed: false,
});

export const UNSIGNED_GBP_OVERRIDE = SCALAR.clone({
  kind: 'GBP',
  decimals: 2,
  signed: false,
}).clone({
  signed: true,
  kind: 'GBP',
});

export const UNSIGNED_GBP_INTEGER = SCALAR.clone({
  kind: 'GBP',
  decimals: 0,
  signed: false,
});

export const EUR = SCALAR.clone({
  kind: 'EUR',
  decimals: 2,
});

export const PHP = SCALAR.clone({
  kind: 'PHP',
  decimals: 0,
});

const dyn: Uppercase<string> = 'USD';
export const USD = SCALAR.clone({
  kind: dyn,
  decimals: 2,
});
