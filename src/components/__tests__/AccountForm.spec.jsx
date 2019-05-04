import sinon from 'sinon';
import React from 'react';
import { mount } from 'enzyme';
import AccountForm from '../AccountForm';
import SuccessMessage from '../SuccessMessage';
import ErrorMessage from '../ErrorMessage';
import AccountInput from '../AccountInput';
import { AccountFactory } from '../../testUtils';

describe('AccountForm', () => {

  function mountForm({ title, onSubmit, accounts=[], value={} }={}) {
    const onChange = sinon.fake();
    return mount(
      <AccountForm
        title={title}
        onSubmit={onSubmit}
        accounts={accounts}
        onChange={onChange}
        value={value} />
    );
  }

  function submitForm(f) {
    return f.instance().handleSubmit({preventDefault: ()=>{}});
  }
  
  it('Mounts with title', () => {
    const title = "A Title";
    const form = mountForm({ title });
    const titleSpan = form.find("span.titleSpan");

    expect(titleSpan).toHaveLength(1);
    expect(titleSpan.html()).toContain(title);
  });
  it('Mounts with input forms', () => {
    const inputNames = ["accType", "name"];
    const form = mountForm();
    for (var i=1; i<inputNames.length; i++) {
      const inputName = inputNames[i];
      expect(form.find({name: inputName})).toHaveLength(1);
    }
  });
  it('Mounts with InputAccount', () => {
    const accounts = AccountFactory.buildList(2);

    const form = mountForm({accounts});

    const accountInput = form.find(AccountInput);
    expect(accountInput).toHaveLength(1);
    expect(accountInput.props().accounts).toBe(accounts);
  });
  it('Parses parent from value to AccountInput...', () => {
    const accounts = AccountFactory.buildList(10);
    const accountSpec = {parent: accounts[1].pk};
    const form = mountForm({accounts, value: accountSpec});
    expect(form.find(AccountInput).props().value).toEqual(accounts[1]);
  });
  it('Calls onChange on name input', () => {
    const form = mountForm();
    const value = "hola";
    expect(form.instance().getAccountSpec().name).toBe(undefined);
    form.find({ name: "name" }).simulate("change", { target: { value } });
    expect(form.props().onChange.calledOnce).toBe(true);
    expect(form.props().onChange.lastCall.args[0].name).toBe(value);
  });
  it('Calls onChange on accType input', () => {
    const form = mountForm();
    const value = "aloh";
    expect(form.instance().getAccountSpec().accType).toBe(undefined);
    form.find({ name: "accType" }).simulate("change", { target: { value } });
    expect(form.props().onChange.calledOnce).toBe(true);
    expect(form.props().onChange.lastCall.args[0].accType).toBe(value);
  });
  it('Calls onChange on parent input', () => {
    const form = mountForm();
    const selectedAcc = AccountFactory.build();
    expect(form.instance().getAccountSpec().parent).toBe(undefined);
    form.find(AccountInput).props().onChange(selectedAcc);
    expect(form.props().onChange.calledOnce).toBe(true);
    expect(form.props().onChange.lastCall.args[0].parent)
      .toBe(selectedAcc.pk);
  });
  it('onSubmit is called with AccountSpec', () => {
    const onSubmit = sinon.fake.resolves();
    const form = mountForm({ onSubmit });
    form.find("form").simulate("submit");
    expect(onSubmit.calledOnce).toBe(true);
    expect(onSubmit.calledWith(form.instance().getAccountSpec())).toBe(true);
  });

  describe('After submit...', () => {
    it('Inits with empty responseMsg', () => {
      expect(mountForm().state().responseMsg).toBe("");
    });
    it('Sets response msg after submit', async () => {
      const responseMsg = { pk: 1, name: "Some Created Acc" };
      const onSubmit = () => Promise.resolve(responseMsg);
      const form = mountForm({ onSubmit });

      await submitForm(form);
      expect(form.state().responseMsg).toEqual(responseMsg);
    });
    it('Resets response msg on new submit', () => {
      const onSubmit = () => Promise.resolve();
      const form = mountForm({onSubmit});
      form.setState({responseMsg: "Some object"});

      submitForm(form);

      expect(form.state().responseMsg).toBe("");
    });
    it('Displays response msg with SuccessMessage component', () => {
      const form = mountForm();
      form.setState({responseMsg: "Some message"});
      form.update();
      form.instance().forceUpdate();

      expect(form.find(SuccessMessage).props().value).toEqual("Some message");
    });
  });

  describe('Error message...', () => {
    it('Displays error message from state', () => {
      const errMsg = "SomeError";
      const form = mountForm();
      expect(form.contains(<ErrorMessage value="" />)).toBe(true);
      form.setState({errMsg});
      expect(form.contains(<ErrorMessage value={errMsg} />)).toBe(true);
    });
    it('Sets error message from onSubmit...', () => {
      expect.assertions(1);
      const errMsg = "SomeError";
      const onSubmit = () => Promise.reject(errMsg);
      const form = mountForm({onSubmit});
      return submitForm(form).then(_ => {
        expect(form.state().errMsg).toEqual(errMsg);
      });
    });
    it('Resets error message after new submit...', () => {
      expect.assertions(1);
      const form = mountForm({onSubmit: () => Promise.resolve({})});
      form.setState({errMsg: "Some old error"});
      return submitForm(form).then(() => {
        expect(form.state().errMsg).toBe("");
      });
    });
  });
  
});
