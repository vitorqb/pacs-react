import React from 'react';
import * as R from 'ramda';
import { lens as AppContextLens } from '../../AppContext';
import { AccountFactory } from '../../../testUtils';
import { mount } from 'enzyme';
import CreateAccountComponentInstance from '../CreateAccountComponent';


describe('CreateAccountComponentInstance...', () => {
  it('Loading while accounts is null...', () => {
    const form = mount(CreateAccountComponentInstance({}));
    expect(form.equals(<p>Loading...</p>)).toBe(true);
  });
  it('Rendered when accounts is not null...', () => {
    const accounts = AccountFactory.buildList(2);
    const appContext = R.set(AppContextLens.accounts, accounts, {});
    const form = mount(CreateAccountComponentInstance({ appContext }));
    expect(form.find('AccountForm')).toHaveLength(1);
    expect(form.find('AccountForm').props().accounts).toEqual(accounts);
  });
});
