import React from 'react';
import AppLens from '../../Lens';
import { lens as AjaxLenses } from '../../Ajax';
import { AccountFactory, CurrencyFactory, TransactionFactory } from '../../../testUtils';
import * as R from 'ramda';
import * as RU from '../../../ramda-utils';
import TransactionTableInstance from '../TransactionTable';
import sinon from 'sinon';
import { mount } from 'enzyme';


describe('TransactionTable', () => {

  it('Still loading', () => {
    const state = {};
    const stateGetters = {};
    const ajaxInjections = {};
    const resp = TransactionTableInstance({ state, stateGetters, ajaxInjections });
    expect(resp).toEqual(<p>Loading...</p>);
  });

  it('Still loading if currencies not loaded', () => {
    const state = RU.setLenses(
      [[AppLens.transactions, TransactionFactory.buildList(2)],
       [AppLens.accounts, AccountFactory.buildList(2)]],
      {}
    );
    const stateGetters = {};
    const ajaxInjections = {};
    const resp = TransactionTableInstance({ state, stateGetters, ajaxInjections });
    expect(resp).toEqual(<p>Loading...</p>);
  });

  it('Still loading if accounts not loaded', () => {
    const state = RU.setLenses(
      [[AppLens.transactions, TransactionFactory.buildList(2)],
       [AppLens.currencies, CurrencyFactory.buildList(2)]],
      {}
    );
    const stateGetters = {};
    const ajaxInjections = {};
    const resp = TransactionTableInstance({ state, stateGetters, ajaxInjections });
    expect(resp).toEqual(<p>Loading...</p>);
  });

  it('Finished loading', () => {
    const transactions = TransactionFactory.buildList(3);
    const movements = R.flatten(R.map(R.prop("movements"), transactions));
    const currenciesPks = R.pipe(
      R.map(R.path(["money", "currency"])),
      R.uniq
    )(movements);
    const currencies = R.map(pk => CurrencyFactory.build({pk}), currenciesPks);
    const accountsPks = R.map(R.prop("account"), movements);
    const accounts = R.map(pk => AccountFactory.build({pk}), accountsPks);
    const state = RU.setLenses(
      [[AppLens.transactions, transactions],
       [AppLens.currencies, currencies],
       [AppLens.accounts, accounts]],
      {}
    );
    const getCurrency = sinon.fake();
    const getAccount = sinon.fake();
    const stateGetters = RU.setLenses(
      [[AppLens.accounts, getAccount], [AppLens.currencies, getCurrency]],
      {},
    );
    const ajaxInjections = {};
    const resp = mount(TransactionTableInstance({ state, stateGetters, ajaxInjections }));
    const transTable = resp.find("TransactionTable");

    expect(transTable).toHaveLength(1);
    expect(transTable.props().title).toBe("Recent Transactions");
    expect(transTable.props().transactions).toEqual(transactions);
    expect(transTable.props().getCurrency).toBe(getCurrency);
  });

});

