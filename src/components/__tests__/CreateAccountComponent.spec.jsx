import React from 'react';
import { mount } from 'enzyme';
import { getSpecFromAccount } from '../../utils.jsx';
import { AccountFactory } from '../../testUtils.jsx';
import CreateAccountComponent from '../CreateAccountComponent.jsx';
import sinon from 'sinon';

function mountCreateAccountComponent(opts) {
  return mount(
    <CreateAccountComponent
      accounts={AccountFactory.buildList(3)}
      createAcc={sinon.fake.resolves()} />
  );
}

describe('CreateAccountComponent', () => {
  it('Updates AccountForm value when state accountSpec is updated', () => {
    const createAccComponent = mountCreateAccountComponent();
    const accountSpec = getSpecFromAccount(AccountFactory.build());
    createAccComponent.instance().setAccountSpec(accountSpec);
    createAccComponent.update();
    expect(createAccComponent.find('AccountForm').props().value).toEqual(accountSpec);
  });
  it('Updates state with AccountForm onChange', () => {
    const createAccComponent = mountCreateAccountComponent();
    const accountSpec = getSpecFromAccount(AccountFactory.build());
    createAccComponent.find('AccountForm').props().onChange(accountSpec);
    expect(createAccComponent.state().accountSpec).toEqual(accountSpec);
  });
  it('Calls createAccount with spec with AccountForm onSubmit', () => {
    expect.assertions(2);
    const createAccComponent = mountCreateAccountComponent();
    const accountSpec = getSpecFromAccount(AccountFactory.build());
    createAccComponent.find('AccountForm').props().onChange(accountSpec);
    return createAccComponent
      .find('AccountForm')
      .props()
      .onSubmit()
      .then(_ => {
        expect(createAccComponent.props().createAcc.calledOnce).toBe(true);
        expect(createAccComponent.props().createAcc.lastCall.args)
          .toEqual([accountSpec]);        
      });
  });
  it('Passes accounts to AccountForm', () => {
    const createAccComponent = mountCreateAccountComponent();
    expect(createAccComponent.find('AccountForm').props().accounts)
      .toBe(createAccComponent.props().accounts);
  });
});
