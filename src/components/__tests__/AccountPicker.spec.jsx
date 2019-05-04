import React from 'react';
import { mount } from 'enzyme';
import { AccountFactory } from '../../testUtils.jsx';
import sinon from 'sinon';
import AccountPicker from '../AccountPicker.jsx';

function mountAccountPicker(opts={}) {
  const { getAccount=sinon.fake.resolves(AccountFactory.build()) } = opts;
  const { onPicked=sinon.fake() } = opts;
  return mount(
    <AccountPicker getAccount={getAccount} onPicked={onPicked} />
  );
}

describe('AccountPicker()', () => {
  it('Stores pk in state on change', () => {
    const pk = 12;
    const picker = mountAccountPicker();
    expect(picker.state().pk).toBe(null);
    picker.find('input[name="pk"]').props().onChange({target: {value: pk}});
    picker.update();
    expect(picker.state().pk).toBe(pk);
  });
  it('Calls getAccount with state pk on submit', () => {
    const pk = 11;
    const picker = mountAccountPicker();
    picker.setState({pk});
    picker.find('form').props().onSubmit({preventDefault: ()=>{}});
    picker.update();
    expect(picker.props().getAccount.calledOnce).toBe(true);
    expect(picker.props().getAccount.lastCall.args).toEqual([pk]);
  });
  it('Calls onPicker with gotten Account', () => {
    expect.assertions(2);
    const account = AccountFactory.build();
    const getAccount = sinon.fake.resolves(account);
    const picker = mountAccountPicker({getAccount});
    return picker
      .find('form')
      .props()
      .onSubmit({preventDefault: ()=>{}})
      .then(_ => {
        picker.update();
        expect(picker.props().onPicked.calledOnce).toBe(true);
        expect(picker.props().onPicked.lastCall.args).toEqual([account]);
      });
  });
});
