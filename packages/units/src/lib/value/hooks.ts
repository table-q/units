import type { FullContext, SignedParam, SignedType, UNIT, Unit } from 'unit';
import { DATA_SYMBOL as _d } from 'util/helpers';
import type { MutableValueData, Value, ValueData } from 'value';

export function useValue<Signed extends SignedType, U extends UNIT, Decimals extends number>(
  that: Value<Signed, U, Decimals>,
): ValueData<Signed, U, Decimals> {
  return that[_d];
}

export function useMutableValue<Signed extends SignedType, U extends UNIT, Decimals extends number>(
  that: Value<Signed, U, Decimals>,
): MutableValueData<Signed, U, Decimals> {
  return that[_d] as MutableValueData<Signed, U, Decimals>;
}

export function useContext<Signed extends SignedParam, U extends UNIT, Decimals extends number>(
  that: Value<Signed, U, Decimals>,
): FullContext<Signed, U, Decimals> {
  return that?.[_d]?.unit?.[_d] ?? {};
}

export function useUnit<Signed extends SignedParam, U extends UNIT, Decimals extends number>(
  that: Value<Signed, U, Decimals>,
): Unit<Signed, U, Decimals> {
  return that?.[_d]?.unit;
}
