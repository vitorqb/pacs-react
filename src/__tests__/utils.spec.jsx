import React from 'react';
import { createTitle, remapKeys, getSourceAccsPks, getTargetAccsPks, newGetter, getSpecFromTransaction, extractMoneysForAccount, isDescendant, memoizeSimple, moneysToRepr } from '../utils';
import { AccountFactory, CurrencyFactory } from '../testUtils.jsx';
import * as R from 'ramda';
import moment from 'moment';

describe('createTitle()', () => {
  it('base', () => {
    const title = "hola";
    const exp = <span className="titleSpan">{title}</span>;
    const res = createTitle(title);
    expect(exp).toEqual(res)
  })
})

describe('remapKeys()', () => {
  it('base', () => {
    const obj = {aaa: 1, b: 2, ccc: 3};
    const keysMapping = {aaa: "e", ccc: "c", d: "d"};
    expect(remapKeys(keysMapping, obj)).toEqual({e: 1, b: 2, c: 3})
  })
})


describe('getSourceAccsPks() and getTargetAccsPks()', () => {
  const movements = [
    {
      account: 1,
      money: {currency: 1, quantity: 1}
    },
    {
      account: 2,
      money: {currency: 1, quantity: -2}
    },
    {
      account: 3,
      money: {currency: 1, quantity: 1}
    }
  ];
  it('Source', () => {
    const exp = [2];
    const res = getSourceAccsPks(movements);
    expect(exp).toEqual(res);
  })
  it('Target', () => {
    const exp = [1, 3];
    const res = getTargetAccsPks(movements);
    expect(exp).toEqual(res);
  })
})

describe('newGetter()', () => {
  it('Simple', () => {
    const getter = newGetter(R.identity, [1, 2, 3]);
    [1, 2, 3].forEach(x => expect(getter(x)).toBe(x))
  })
  it('Complex extractValue', () => {
    const getter = newGetter(R.prop("a"), [{a: 1}, {a: 2, b: 3}, {a: 3}]);
    expect(getter(1)).toEqual({a: 1});
    expect(getter(2)).toEqual({a: 2, b: 3});
  })
})

describe('getSpecFromTransaction()', () => {
  const transaction = {
    pk: 1,
    description: "hola",
    movements: [],
    date: moment.utc("1922-21-22")
  };
  const transactionSpec = getSpecFromTransaction(transaction);
  it('No pk copied', () => {
    expect(transactionSpec.pk).toBe(undefined);
  })
  it('Same description', () => {
    expect(transactionSpec.description).toBe(transaction.description);
  })
  it('Same movements', () => {
    expect(transactionSpec.movements).toBe(transaction.movements);
  })
  it('Same date', () => {
    expect(transactionSpec.date).toBe(transaction.date);
  })
})


describe('extractMoneyForAccount', () => {
  it('base', () => {
    const [account, otherAccount] = AccountFactory.buildList(2);
    const getAccount = newGetter(R.prop('pk'), [account, otherAccount]);
    const movements = [
      {account: account.pk, money: {currency: 2, quantity: 3}},
      {account: otherAccount.pk, money: {currency: 2, quantity: -3}}
    ];
    const isDescendant = () => false;
    expect(extractMoneysForAccount(getAccount, isDescendant, account, movements))
      .toEqual([movements[0].money]);
  })
  it('with hierarchy', () => {
    const [root, child, other] = AccountFactory.buildList(3);
    const getAccount = newGetter(R.prop('pk'), [root, child, other]);
    const movements = [
      {account: root.pk, money: {currency: 1, quantity: 10}},
      {account: child.pk, money: {currency: 1, quantity: 20}},
      {account: other.pk, money: {currency: 2, quantity: 30}}
    ];
    const isDescendant = (accOne, accTwo) => {
      return accOne.pk === child.pk && accTwo.pk === root.pk;
    };
    expect(extractMoneysForAccount(getAccount, isDescendant, root, movements))
      .toEqual([movements[0].money, movements[1].money]);
  })
})


describe('isDescendant', () => {
  it('base false', () => {
    const accounts = AccountFactory.buildList(2);
    expect(isDescendant(accounts, accounts[0], accounts[1])).toBe(false);
  })
  it('base true', () => {
    const parent = AccountFactory.build();
    const child = AccountFactory.build({parent: parent.pk});
    expect(isDescendant([child, parent], child, parent)).toBe(true);
  })
  it('son of son', () => {
    const grandParent = AccountFactory.build();
    const parent = AccountFactory.build({parent: grandParent.pk});
    const child = AccountFactory.build({parent: parent.pk});
    const accounts = [grandParent, parent, child];
    expect(isDescendant(accounts, child, grandParent)).toBe(true);
  })
  it('same account is false', () => {
    const accounts = AccountFactory.buildList(3);
    expect(isDescendant(accounts, accounts[0], accounts[0])).toBe(false);
  })
})


describe('moneysToRepr', () => {
  it('one money', () => {
    const money = {currency: 2, quantity: 12.12};
    const getCurrency = memoizeSimple(CurrencyFactory.build);
    expect(moneysToRepr(getCurrency, [money])).toEqual(
      `+12.12 ${getCurrency(2).name}`
    );
  })
  it('two moneys', () => {
    const currencies = CurrencyFactory.buildList(2);
    const getCurrency = newGetter(R.prop('pk'), currencies);
    const moneys = [
      {currency: currencies[0].pk, quantity: -12.112},
      {currency: currencies[1].pk, quantity: 22}
    ];
    expect(moneysToRepr(getCurrency, moneys)).toEqual(
      `-12.11 ${currencies[0].name}; +22.00 ${currencies[1].name}`
    );
  })
})
