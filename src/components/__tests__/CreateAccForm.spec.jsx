import sinon from 'sinon';
import React from 'react';
import { mount } from 'enzyme';
import CreateAccForm from '../CreateAccForm';
import SuccessMessage from '../SuccessMessage';
import ErrorMessage from '../ErrorMessage';
import AccountInput from '../AccountInput';
import { AccountFactory } from '../../testUtils';

describe('CreateAccForm', () => {

  function mountForm({ title, createAcc, accounts=[] }={}) {
    return mount(
      <CreateAccForm title={title} createAcc={createAcc} accounts={accounts} />
    )
  }

  function submitForm(f) {
    return f.instance().handleSubmit({preventDefault: ()=>{}})
  }
  
  it('Mounts with title', () => {
    const title = "A Title";
    const form = mountForm({ title });
    const titleSpan = form.find("span.titleSpan");

    expect(titleSpan).toHaveLength(1);
    expect(titleSpan.html()).toContain(title);
  })
  it('Mounts with input forms', () => {
    const inputNames = ["accType", "name"];
    const form = mountForm();
    for (var i=1; i<inputNames.length; i++) {
      const inputName = inputNames[i];
      expect(form.find({name: inputName})).toHaveLength(1)
    }
  })
  it('Mounts with InputAccount', () => {
    const accounts = AccountFactory.buildList(2);

    const form = mountForm({accounts});

    const accountInput = form.find(AccountInput);
    expect(accountInput).toHaveLength(1);
    expect(accountInput.props().accounts).toBe(accounts);
  })
  it('Updates InputAccount value on selection...', () => {
    const accounts = AccountFactory.buildList(10);
    const form = mountForm({accounts});
    form.find(AccountInput).props().onChange(accounts[3]);
    form.update()
    expect(form.find(AccountInput).props().value).toEqual(accounts[3]);
  })
  it('Updates on name input', () => {
    const form = mountForm();
    const value = "hola";
    expect(form.instance().state.name).toBe("")
    form.find({ name: "name" }).simulate("change", { target: { value } })
    expect(form.instance().state.name).toBe(value)
  })
  it('Updates on accType input', () => {
    const form = mountForm();
    const value = "aloh";
    expect(form.instance().state.accType).toBe("")
    form.find({ name: "accType" }).simulate("change", { target: { value } })
    expect(form.instance().state.accType).toBe(value)
  })
  it('Updates on parent input', () => {
    const form = mountForm();
    const selectedAcc = AccountFactory.build();
    expect(form.instance().state.parent).toBe("");
    form.find(AccountInput).props().onChange(selectedAcc);
    expect(form.instance().state.parent).toBe(selectedAcc.pk);
  })
  it('accCretor is called when submit', () => {
    const createAcc = sinon.fake.resolves();
    const form = mountForm({ createAcc });
    form.find("form").simulate("submit")
    expect(createAcc.called).toBe(true)
  })

  describe('After submit...', () => {
    it('Inits with empty responseMsg', () => {
      expect(mountForm().state().responseMsg).toBe("");
    })
    it('Sets response msg after submit', async () => {
      const responseMsg = { pk: 1, name: "Some Created Acc" };
      const createAcc = () => Promise.resolve(responseMsg);
      const form = mountForm({ createAcc });

      await submitForm(form);
      expect(form.state().responseMsg).toEqual(responseMsg);
    })
    it('Resets response msg on new submit', () => {
      const createAcc = () => Promise.resolve();
      const form = mountForm({createAcc});
      form.setState({responseMsg: "Some object"});

      submitForm(form);

      expect(form.state().responseMsg).toBe("");
    })
    it('Displays response msg with SuccessMessage component', () => {
      const form = mountForm();
      form.setState({responseMsg: "Some message"});
      form.update();
      form.instance().forceUpdate();

      expect(form.find(SuccessMessage).props().value).toEqual("Some message");
    })
  })

  describe('Error message...', () => {
    it('Displays error message from state', () => {
      const errMsg = "SomeError";
      const form = mountForm();
      expect(form.contains(<ErrorMessage value="" />)).toBe(true);
      form.setState({errMsg});
      expect(form.contains(<ErrorMessage value={errMsg} />)).toBe(true);
    })
    it('Sets error message from createAcc...', () => {
      expect.assertions(1);
      const errMsg = "SomeError";
      const createAcc = () => Promise.reject(errMsg);
      const form = mountForm({createAcc});
      return submitForm(form).then(_ => {
        expect(form.state().errMsg).toEqual(errMsg);
      });
    })
    it('Resets error message after new submit...', () => {
      expect.assertions(1);
      const form = mountForm({createAcc: () => Promise.resolve({})});
      form.setState({errMsg: "Some old error"});
      return submitForm(form).then(() => {
        expect(form.state().errMsg).toBe("");
      })
    })
  })
  
})
