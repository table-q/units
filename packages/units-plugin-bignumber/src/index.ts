import { extend } from '@table-q/units';
import BigNumber from 'bignumber.js';

declare module '@table-q/units' {
  interface Value<Signed, U, Decimals> {
    bignumber(
      fn: (n: BigNumber) => BigNumber,
      config?: BigNumber.Config,
    ): Value<Signed, U, Decimals>;
  }
}

extend((proto) => {
  proto.bignumber = function (fn, config?) {
    const BN = config ? BigNumber.clone(config) : BigNumber;
    const [_num, _den] = this.toFraction().split('/');
    const result = fn(new BN(_num).dividedBy(_den));
    const [num, den] = result.toFraction();
    return this.sub(this).add(`${num}/${den}` as `${number}/${number}`);
  };
});
