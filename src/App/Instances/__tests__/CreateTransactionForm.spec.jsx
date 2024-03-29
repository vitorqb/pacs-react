import React from 'react';
import * as RU from '../../../ramda-utils';
import { lens as AppContextLens } from '../../AppContext';
import { AccountFactory, CurrencyFactory } from '../../../testUtils';
import { mount } from 'enzyme';
import CreateTransactionComponentInstance from '../CreateTransactionForm';


describe('CreateTransactionComponent...', () => {

  it('Loading while accounts is null...', () => {
    const form = mount(CreateTransactionComponentInstance({}));
    expect(form.equals(<p>Loading...</p>)).toBe(true);
  });

  it('Rendered when accounts and currencies are not null...', () => {
    const accounts = AccountFactory.buildList(2);
    const currencies = CurrencyFactory.buildList(2);
    const appContext = RU.objFromPairs(
      AppContextLens.accounts, accounts,
      AppContextLens.currencies, currencies,
    );
    const form = mount(CreateTransactionComponentInstance({ appContext }));
    expect(form.find('CreateTransactionComponent')).toHaveLength(1);
    expect(form.find('CreateTransactionComponent').props().accounts).toEqual(accounts);
  });

});
