import React from 'react';
import { mount } from 'enzyme';
import EditAccountComponent from '../EditAccountComponent.jsx';
import { AccountFactory } from '../../testUtils.jsx';
import { getSpecFromAccount } from '../../utils.jsx';
import sinon from 'sinon';

function mountEditAccComponent(props={}) {
  const { accounts=AccountFactory.buildList(5) } = props;
  const { editAccount=sinon.fake.resolves({}) } = props;
  return mount(
    <EditAccountComponent accounts={accounts} editAccount={editAccount} />
  )
}

describe('EditAccountComponent', () => {
  it('Passes accounts and account spec to AccountForm accounts prop', () => {
    const accounts = AccountFactory.buildList(3);
    const accountSpec = getSpecFromAccount(accounts[0]);
    const editAccComponent = mountEditAccComponent({accounts})
    editAccComponent.instance().setAccountSpec(accountSpec);
    editAccComponent.update()

    expect(editAccComponent.props().accounts).toBe(accounts);
    expect(editAccComponent.find('AccountForm').props().accounts).toEqual(accounts);
    expect(editAccComponent.find('AccountForm').props().value).toEqual(accountSpec);
  })
  it('Do not renders AccountForm if no Account selected', () => {
    const editAccComponent = mountEditAccComponent();

    expect(editAccComponent.instance().getAccountSpec()).toEqual(null);
    expect(editAccComponent.find('AccountForm')).toHaveLength(0);

    const account = editAccComponent.props().accounts[1];
    editAccComponent.instance().setAccountSpec(getSpecFromAccount(account));
    editAccComponent.update()

    expect(editAccComponent.find('AccountForm')).toHaveLength(1);
  })
  it('Updates accountSpec on submit for AccountInput', () => {
    const editAccComponent = mountEditAccComponent();
    const account = editAccComponent.props().accounts[1];
    editAccComponent.find('AccountInput').props().onChange(account);
    expect(editAccComponent.instance().getAccountSpec())
      .toEqual(getSpecFromAccount(account));
  })
  it('Calls editAcc with acc and accSpec on submit of AccountForm', () => {
    const editAccComponent = mountEditAccComponent();
    const account = editAccComponent.props().accounts[0];
    const accountSpec = getSpecFromAccount(account);
    editAccComponent.find('AccountInput').props().onChange(account);
    editAccComponent.update();
    editAccComponent.find('AccountForm').props().onSubmit(accountSpec);
    expect(editAccComponent.props().editAccount.calledOnce).toBe(true);
    expect(editAccComponent.props().editAccount.lastCall.args)
      .toEqual([account, accountSpec]);
  })
})
