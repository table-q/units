import type { Infinity } from 'util/helpers';

export enum ErrorCode {
  INVALID_TYPE = 'INVALID_TYPE',
  INVALID_CONVERSION = 'INVALID_CONVERSION',
  DIVISION_BY_ZERO = 'DIVISION_BY_ZERO',
  UNDERFLOW = 'UNDERFLOW',
  OVERFLOW = 'OVERFLOW',
  UNSUPPORTED_ROUNDING_MODE = 'UNSUPPORTED_ROUNDING_MODE',
  NOT_PRECISION = 'NOT_PRECISION',
  NOT_BITSIZE = 'NOT_BITSIZE',
  IMPRECISE_CONVERSION = 'IMPRECISE_CONVERSION',
}

type ERROR_CODE = `${ErrorCode}` | symbol;

class UnitError extends TypeError {
  constructor(
    message: string,
    public code: ERROR_CODE,
  ) {
    super(message ? `${String(code)}: ${message}` : String(code));
  }
}

const ErrorTemplates = {
  INVALID_TYPE: (paramName: string, type: unknown) =>
    new UnitError(`'${paramName}' is not '${type}'`, ErrorCode.INVALID_TYPE),
  INVALID_CONVERSION: (from: string, to: string) =>
    new UnitError(`Cannot convert '${from}' to '${to}'`, ErrorCode.INVALID_CONVERSION),
  DIVISION_BY_ZERO: () => new UnitError('', ErrorCode.DIVISION_BY_ZERO),
  UNDERFLOW: () => new UnitError('', ErrorCode.UNDERFLOW),
  OVERFLOW: () => new UnitError('', ErrorCode.OVERFLOW),
  UNSUPPORTED_ROUNDING_MODE: (roundingMode: string) =>
    new UnitError(roundingMode, ErrorCode.UNSUPPORTED_ROUNDING_MODE),
  NOT_PRECISION: (
    paramName: string,
    decimalParamName: string,
    precision: number | Infinity,
    decimals: number,
  ) =>
    new UnitError(
      `'${precision}' provided for '${paramName}' cannot be used as a precision because '${paramName}' should be either Infinity or an integer where "${paramName}" >= ${decimals} ("${decimalParamName}") and not zero`,
      ErrorCode.NOT_PRECISION,
    ),
  NOT_BITSIZE: (paramName: string, bitsize: number) =>
    new UnitError(
      `'${bitsize}' provided for '${paramName}' cannot be used as bitsize because '${paramName}' should be either Infinity or a positive integer and not zero`,
      ErrorCode.NOT_BITSIZE,
    ),
  IMPRECISE_CONVERSION: () =>
    new UnitError(
      "use the 'round()' function or the 'roundingMode' parameter",
      ErrorCode.IMPRECISE_CONVERSION,
    ),
} as const;

export const Errors = new Proxy(ErrorTemplates, {
  get(target, p: keyof typeof ErrorTemplates) {
    const Constructor = target[p] as (...args: unknown[]) => TypeError;
    return (...args: unknown[]) => {
      const error = Constructor(...args);
      // istanbul ignore next
      const trace = error.stack?.split('\n') ?? [];
      trace.splice(1, 2);
      error.stack = trace.join('\n');
      return error;
    };
  },
});
