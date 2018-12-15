import sinon from 'sinon';
import React from 'react';
import { mount } from 'enzyme';
import CreateAccForm from '../CreateAccForm';
import SuccessMessage from '../SuccessMessage';


describe('CreateAccForm', () => {

  function mountForm({ title, createAcc }={}) {
    return mount(<CreateAccForm title={title} createAcc={createAcc} />)
  }
  
  it('Mounts with title', () => {
    const title = "A Title";
    const form = mountForm({ title });
    const titleSpan = form.find("span.titleSpan");

    expect(titleSpan).toHaveLength(1);
    expect(titleSpan.html()).toContain(title);
  })
  it('Mounts with input forms', () => {
    const inputNames = ["name", "accType", "parent"];
    const form = mountForm();
    for (var i=1; i<inputNames.length; i++) {
      const inputName = inputNames[i];
      expect(form.find({name: inputName})).toHaveLength(1)
    }
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
    const value = 2;
    expect(form.instance().state.name).toBe("")
    form.find({ name: "parent" }).simulate("change", { target: { value } })
    expect(form.instance().state.parent).toBe(value)
  })
  it('accCretor is called when submit', () => {
    const createAcc = sinon.fake.resolves();
    const form = mountForm({ createAcc });
    form.find("form").simulate("submit")
    expect(createAcc.called).toBe(true)
  })

  describe('After submit...', () => {
    function submitForm(f) {
      return f.instance().handleSubmit({preventDefault: ()=>{}})
    }
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
  
})
