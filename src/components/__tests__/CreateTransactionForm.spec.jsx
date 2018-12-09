import * as R from 'ramda';
import React from 'react';
import { mount } from 'enzyme';
import CreateTransactionForm from '../CreateTransactionForm';
import MovementForm from '../MovementForm';


/**
 * Uses enzyme to mount a CreateTransactionForm
 * @param {string} props.title - The title.
 */
function mountCreateTransactionForm({ title="" }={}) {
  return mount(<CreateTransactionForm title={title} />)
}

describe('CreateTransactionForm', () => {

  let formComponent;

  beforeEach(() => {
    formComponent = mountCreateTransactionForm();
  })


  it('Mounts with title', () => {
    const title = "aloha";
    const formComponent = mountCreateTransactionForm({title});
    expect(formComponent.find("span.titleSpan").html()).toContain(title);
  })

  it('Mounts with all inputs and empty strings', () => {
    const inputNames = ["description", "date"];
    for (var i=0; i<inputNames.length; i++) {
      const name = inputNames[i];
      const input = formComponent.find(`input[name="${name}"]`);
      expect(input).toHaveLength(1);
      expect(input.instance().value).toBe("");
    }
  })

  it('Mounts with two empty MovementForm', () => {
    const movementForms = formComponent.find(MovementForm);
    expect(movementForms).toHaveLength(2);
    for (var i=0; i<movementForms.length; i++) {
      const movementForm = movementForms.get(i);
      expect(movementForm.isEmpty()).toBe(true);
    }
  })

  it('Updates description on change', () => {
    const value = "My Description";
    const descriptionInput = formComponent.find('input[name="description"]');
    expect(descriptionInput.instance().value).toBe("");
    expect(formComponent.state().description).toBe("");

    descriptionInput.simulate("change", { target: { value } })

    expect(descriptionInput.instance().value).toBe(value);
    expect(formComponent.state().description).toBe(value);
  })

  it('Updates date on change', () => {
    const value = "2018-01-01";
    const dateInput = formComponent.find('input[name="date"]');
    expect(dateInput.instance().value).toBe("");
    expect(formComponent.state().date).toBe("");

    dateInput.simulate("change", { target: { value } })

    expect(dateInput.instance().value).toBe(value);
    expect(formComponent.state().date).toBe(value);
  })
})
