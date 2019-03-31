import { mount } from 'enzyme';
import React, { createElement } from 'react';
import MultipleAccountsSelector, { WithDeleteButton, AddButton } from '../MultipleAccountsSelector.jsx';
import * as R from 'ramda';
import { AccountFactory } from '../../testUtils.jsx';
import sinon from 'sinon';
import { omitIndexes } from '../../utils';

function mountMultipleAccountsSelector(opts) {
  const selectedAccounts = opts.selectedAccounts || [null, null];
  const accounts = opts.accounts || AccountFactory.buildList(2);
  const onSelectedAccountsChange = opts.onSelectedAccountsChange || (()=>{});
  return mount(createElement(
    MultipleAccountsSelector,
    { accounts, selectedAccounts, onSelectedAccountsChange }
  ));
}

function findAccInputs(comp, i) {
  const found = comp.find('[data-acc-input]');
  return R.isNil(i) ? found : found.at(i);
}

function selectAccount(comp, newAcc) {
  comp.props().onChange(newAcc);
}

function findDeleteButtons(comp, i) {
  const found = comp.find('[data-delete-but]');
  return R.isNil(i) ? found : found.at(i);
}

function findAddButtons(comp, i) {
  const found = comp.find('[data-add-but]');
  return R.isNil(i) ? found : found.at(i);
}

function getValue(comp) {
  return comp.props().value;
}

function clickDeleteButton(comp, i) {
  findDeleteButtons(comp, i).props().onClick();
}

function clickAddButton(comp, i) {
  findAddButtons(comp, i).props().onClick();
}

describe('MultipleAccountsSelector', () => {
  describe('Mapping values to DOM', () => {
    it('Two null selectedAccounts', () => {
      const selectedAccounts = [null, null];
      const component = mountMultipleAccountsSelector({ selectedAccounts });
      // Expect exactly 2 null account input.
      expect(findAccInputs(component).length).toEqual(2);
      expect(R.all(
        R.identity,
        findAccInputs(component).map(accInp => R.isNil(getValue(accInp)))
      )).toBe(true);
    });
    it('Not null', () => {
      const account = AccountFactory.build();
      const selectedAccounts = [account];
      const comp = mountMultipleAccountsSelector({ selectedAccounts });
      expect(R.pipe(findAccInputs, getValue)(comp)).toEqual(account);
    });
  });
  it('Passes down accounts prop to AccountInput', () => {
    const accounts = AccountFactory.buildList(2);
    const selectedAccounts = [null];
    const comp = mountMultipleAccountsSelector({accounts, selectedAccounts});
    expect(findAccInputs(comp).props().accounts).toBe(accounts);
  });
  it('Removing a specific AccountInput', () => {
    const onSelectedAccountsChange = sinon.fake();
    const selectedAccounts = AccountFactory.buildList(3);
    const comp = mountMultipleAccountsSelector({
      selectedAccounts,
      onSelectedAccountsChange
    });

    clickDeleteButton(comp, 1);

    expect(onSelectedAccountsChange.args).toEqual([[
      omitIndexes([1], selectedAccounts)
    ]]);
  });
  it('Adding a new AccountInput', () => {
    const onSelectedAccountsChange = sinon.fake();
    const selectedAccounts = [null];
    const comp = mountMultipleAccountsSelector({
      selectedAccounts,
      onSelectedAccountsChange
    });

    clickAddButton(comp);

    expect(onSelectedAccountsChange.args).toEqual([[[null, null]]]);
  });
  it('Passes changes up from AccountInput', () => {
    const account = AccountFactory.build();
    const accounts = [account];
    const onSelectedAccountsChange = sinon.fake();
    const selectedAccounts = [null, null];
    const comp = mountMultipleAccountsSelector({
      selectedAccounts,
      onSelectedAccountsChange,
      accounts
    });

    selectAccount(findAccInputs(comp, 1), account);

    expect(onSelectedAccountsChange.args).toEqual([[[null, account]]]);
  });
});


describe('WithDeleteButton', () => {
  it('Base', () => {
    const unmountedComp = <div id="foo" />;
    const onDelete = sinon.fake();
    const comp = mount(
      <WithDeleteButton key={1} onDelete={onDelete}>
        {unmountedComp}
      </WithDeleteButton>
    );
    expect(comp.find("#foo").length).toBe(1);
    clickDeleteButton(comp, 0);
    expect(onDelete.args).toEqual([[]]);
  });
});


describe('AddButton', () => {
  it('Calls onAdd on button click', () => {
    const onAdd = sinon.fake();
    const comp = mount(<AddButton onAdd={onAdd} />);
    clickAddButton(comp);
    expect(onAdd.args).toEqual([[]]);
  });
});
