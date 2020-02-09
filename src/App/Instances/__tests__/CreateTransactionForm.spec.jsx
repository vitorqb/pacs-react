import React from 'react';
import * as RU from '../../../ramda-utils';
import { lens as AppLens } from '../../Lens';
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
    const state = RU.objFromPairs(
      AppLens.accounts, accounts,
      AppLens.currencies, currencies,
    );
    const form = mount(CreateTransactionComponentInstance({ state }));
    expect(form.find('CreateTransactionComponent')).toHaveLength(1);
    expect(form.find('CreateTransactionComponent').props().accounts).toEqual(accounts);
  });

});
