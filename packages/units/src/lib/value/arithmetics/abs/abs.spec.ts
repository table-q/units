import { GBP, UNSIGNED_GBP } from 'value/arithmetics/testTypes';

describe('abs()', () => {
  it('should return the absolute value of an unsigned value', () => {
    expect(UNSIGNED_GBP('1').abs()).toBeUnit('1');
  });
  it('should return the absolute value of a signed value', () => {
    expect(GBP('0').abs()).toBeUnit('0');
    expect(GBP('1').abs()).toBeUnit('1');
    expect(GBP('-1').abs()).toBeUnit('1');
  });
  it('should not mutate the original value', () => {
    const neg = GBP('-1');
    expect(neg.abs() instanceof GBP).toEqual(true);
    expect(neg).toBeUnit('-1');
  });
});
