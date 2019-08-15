import React from 'react';
import * as sut from '../DeleteAccountComponent';
import DeleteAccountComponent from '../DeleteAccountComponent';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { AccountFactory } from '../../testUtils';
import * as R from 'ramda';
import * as RU from '../../ramda-utils';

const mountDeleteAccountComponent = ({ accounts, selectedAccount }) => {
  const _accounts = R.isNil(accounts) ? AccountFactory.buildList(2) : accounts;
  const _onChange = sinon.fake();
  const _value = R.set(sut.valueLens.selectedAccount, selectedAccount, {});
  const _props = RU.setLenses(
    [
      [sut.propsLens.onChange, _onChange],
      [sut.propsLens.accounts, _accounts],
      [sut.propsLens.value, _value],
    ],
    {}
  );
  return mount(<DeleteAccountComponent {..._props} />);
};

const findAccountInput = c => c.find('AccountInput');
const getAccountsInputProp = (c, l) => R.view(l, findAccountInput(c).props());
const simulateAccountInputValueChange = (c, v) => {
  findAccountInput(c).props().onChange(v);
  c.update();
};
const simulateSubmit = c => {
  c.find('form').props().onSubmit({preventDefault: sinon.fake()});
};

describe('DeleteAccountComponent', () => {

  it('Mounts account input', () => {
    const accounts = AccountFactory.buildList(1);
    const selectedAccount = accounts[0];
    const component = mountDeleteAccountComponent({ accounts, selectedAccount });

    expect(getAccountsInputProp(component, R.lensProp('accounts'))).toBe(accounts);
    expect(getAccountsInputProp(component, R.lensProp('value'))).toBe(selectedAccount);
  });

  it('Handles account input value change.', () => {
    const component = mountDeleteAccountComponent({});
    const selectedAccount = AccountFactory.build();

    simulateAccountInputValueChange(component, selectedAccount);

    expect(component.props().onChange.args).toHaveLength(1);
    expect(component.props().onChange.args[0]).toHaveLength(1);
    const reducer = component.props().onChange.args[0][0];
    expect(R.view(sut.valueLens.selectedAccount, reducer({}))).toEqual(selectedAccount);
  });

  describe('handleSubmit', () => {

    it("Calls parent's onSubmitDelete if there is selectedAccount", () => {
      const event = {preventDefault: sinon.fake()};
      const onSubmitDelete = sinon.fake();
      const account = AccountFactory.build();
      const value = RU.setLenses([[sut.valueLens.selectedAccount, account]], {});
      const props = RU.setLenses(
        [[sut.propsLens.value, value],
         [sut.propsLens.onSubmitDelete, onSubmitDelete],
         [sut.propsLens.onChange, sinon.fake()]],
        {}
      );

      sut.handleSubmit(props, event);

      expect(onSubmitDelete.args).toEqual([[account]]);
    });

    it('Sets errMsg if no selectedAccount', () => {
      const event = {preventDefault: sinon.fake()};
      const onChange = sinon.fake();
      const props = RU.setLenses(
        [[sut.propsLens.value, {}],
         [sut.propsLens.onChange, onChange]],
        {}
      );

      sut.handleSubmit(props, event);

      expect(onChange.args).toHaveLength(1);
      expect(onChange.args[0]).toHaveLength(1);
      const reducer = onChange.args[0][0];
      expect(R.view(sut.valueLens.errorMsg, reducer({})))
        .toEqual(sut.ERRORS.AccountNotSelected);
    });

  });
  
});
