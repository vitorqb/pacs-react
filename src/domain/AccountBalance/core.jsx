import * as utils from '../../utils';

/**
 * Transforms the data for the balance of one account at one date into the data
 * for a table cell displaying this balance.
 */
export const toCellData = ({getAccount, getCurrency, data}) => {
  return {
    xLabel: data.date,
    yLabel: getAccount(data.account).name,
    value: utils.moneysToRepr(getCurrency, data.balance),
  };
};
