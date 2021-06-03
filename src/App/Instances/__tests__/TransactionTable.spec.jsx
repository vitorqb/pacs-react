import React from 'react';
import AppLens from '../../Lens';
import { AccountFactory, CurrencyFactory, TransactionFactory } from '../../../testUtils';
import * as R from 'ramda';
import * as RU from '../../../ramda-utils';
import TransactionTableInstance from '../TransactionTable';
import sinon from 'sinon';
import { mount } from 'enzyme';
import ReactTestUtils from 'react-dom/test-utils';


describe('TransactionTable', () => {

  it('Still loading', () => {
    const appContext = {};
    const appContextGetters = {};
    const ajaxInjections = {getPaginatedTransactions: () => Promise.resolve({})};
    const resp = TransactionTableInstance({ appContext, appContextGetters, ajaxInjections });
    expect(resp).toEqual(<p>Loading...</p>);
  });

  it('Still loading if currencies not loaded', () => {
    const appContext = RU.objFromPairs(
      AppLens.accounts, AccountFactory.buildList(2),
    );
    const appContextGetters = {};
    const ajaxInjections = {getPaginatedTransactions: () => Promise.resolve({})};
    const resp = TransactionTableInstance({ appContext, appContextGetters, ajaxInjections });
    expect(resp).toEqual(<p>Loading...</p>);
  });

  it('Still loading if accounts not loaded', () => {
    const appContext = RU.objFromPairs(
      AppLens.currencies, CurrencyFactory.buildList(2),
    );
    const appContextGetters = {};
    const ajaxInjections = {getPaginatedTransactions: () => Promise.resolve({})};
    const resp = TransactionTableInstance({ appContext, appContextGetters, ajaxInjections });
    expect(resp).toEqual(<p>Loading...</p>);
  });

  it('Finished loading', async () => {
    const currencies = CurrencyFactory.buildList(2);
    const accounts = AccountFactory.buildList(2);
    const appContext = RU.objFromPairs(
      AppLens.currencies, currencies,
      AppLens.accounts, accounts,
    );
    const getCurrency = sinon.fake();
    const getAccount = sinon.fake();
    const getPaginatedTransactions = () => Promise.resolve({});
    const appContextGetters = RU.objFromPairs(
      AppLens.accounts, getAccount,
      AppLens.currencies, getCurrency,
    );
    const ajaxInjections = {getPaginatedTransactions};

    await ReactTestUtils.act(async () => {
      const resp = mount(TransactionTableInstance({ appContext, appContextGetters, ajaxInjections }));
      const transTable = resp.find("TransactionTable");

      expect(transTable).toHaveLength(1);
      expect(transTable.props().getCurrency).toBe(getCurrency);
      expect(transTable.props().getAccount).toBe(getAccount);
      expect(transTable.props().getPaginatedTransactions).toBe(getPaginatedTransactions);
    });
  });

});

