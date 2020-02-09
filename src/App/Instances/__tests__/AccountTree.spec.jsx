import React from 'react';
import * as R from 'ramda';
import { lens as AppLens } from '../../Lens';
import { AccountFactory } from '../../../testUtils';
import { mount } from 'enzyme';
import AccountTree from '../AccountTree';


describe('AccountTree', () => {

  it('Shows loading if accounts is null', () => {
    const accountTree = mount(AccountTree({}));
    expect(accountTree.equals(<p>Loading...</p>)).toBe(true);
  });

  it('Shows accounts if parsed', () => {
    const accounts = AccountFactory.buildRootAndChildren(2);
    const state = R.set(AppLens.accounts, accounts, {});
    const accountTree = mount(AccountTree({ state }));
    expect(accountTree.find('AccountTree')).toHaveLength(1);
    expect(accountTree.find('AccountTree').props().accounts).toBe(accounts);
  });
  
});
