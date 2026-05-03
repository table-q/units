import { Bandwith, calculateConstants, TaxRate } from './constants';

export const constants = calculateConstants({
  DEFAULT: {
    B: [Bandwith('0'), Bandwith('37700'), Bandwith('87440')],
    R: [TaxRate('10.00'), TaxRate('20.00'), TaxRate('40.00'), TaxRate('45.00')],
    G: 2,
    M: TaxRate('50.00'),
  },
  SCOTLAND: {
    B: [
      Bandwith('3967'),
      Bandwith('12989'),
      Bandwith('14136'),
      Bandwith('31338'),
      Bandwith('62710'),
    ],
    R: [
      TaxRate('19.00'),
      TaxRate('20.00'),
      TaxRate('21.00'),
      TaxRate('42.00'),
      TaxRate('45.00'),
      TaxRate('48.00'),
    ],
    G: 2,
    M: TaxRate('50.00'),
  },
  WALES: {
    B: [Bandwith('0'), Bandwith('37700'), Bandwith('87440')],
    R: [TaxRate('10.00'), TaxRate('20.00'), TaxRate('40.00'), TaxRate('45.00')],
    G: 2,
    M: TaxRate('50.00'),
  },
});
