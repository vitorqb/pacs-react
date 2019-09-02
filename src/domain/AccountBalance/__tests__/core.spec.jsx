import { AccountFactory, CurrencyFactory } from '../../../testUtils';
import * as sut from '../core';
import * as utils from '../../../utils';
import * as R from 'ramda';

/**
 * Returns an array of two account balances.
 */
const makeAccountBalances = (currencies, accounts) => [
  {
    "date": "2019-01-31",
    "account": accounts[0].pk,
    "balance": []
  },
  {
    "date": "2019-01-31",
    "account": accounts[1].pk,
    "balance": [
      {
        "quantity": "-3294.90000",
        "currency": currencies[0].pk
      },
      {
        "quantity": "-28.58000",
        "currency": currencies[1].pk
      }
    ]
  },
];

describe('toCellData', () => {

  let accounts, getAccount, currencies, getCurrency;

  beforeEach(() => {
    accounts = AccountFactory.buildList(2);
    getAccount = utils.newGetter(R.prop('pk'), accounts);
    currencies = CurrencyFactory.buildList(2);
    getCurrency = utils.newGetter(R.prop('pk'), currencies);
  });

  it('Base', () => {
    const data = makeAccountBalances(currencies, accounts)[1];
    expect(sut.toCellData({getAccount, getCurrency, data})).toEqual({
      xLabel: "2019-01-31",
      yLabel: accounts[1].name,
      value: utils.moneysToRepr(getCurrency, data.balance)
    });
  });

});
