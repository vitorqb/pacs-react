import * as R from 'ramda';
import React from 'react';
import { mount } from 'enzyme';
import CreateTransactionForm from '../CreateTransactionForm';
import MovementInputs from '../MovementInputs';


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
    expect(formComponent.find("span.titleSpan").first().html()).toContain(title);
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

  it('Mounts with two empty states for movements', () => {
    const movementsInputsStates = formComponent.state().movements;
    expect(movementsInputsStates).toEqual([
      {
        quantity: "",
        account: "",
        currency: ""
      },
      {
        quantity: "",
        account: "",
        currency: ""
      }
    ])
  })

  it('Mounts with two MovementInputs components', () => {
    expect(formComponent.find(MovementInputs)).toHaveLength(2);
  })

  it('Updates on change of movement account', () => {
    const value = 12345;
    const movementInputsOne = formComponent.find(MovementInputs).at(0);
    movementInputsOne.find('input[name="account"]').simulate(
      "change",
      { "target": { value } }
    );
    expect(formComponent.state().movements[0].account).toBe(value);
  })

  it('Updates on change of movement currency', () => {
    const value = 2;
    formComponent.find(MovementInputs).at(1).find('input[name="currency"]').simulate(
      "change",
      { "target": { value } }
    );
    expect(formComponent.state().movements[1].currency).toBe(value);
    expect(formComponent.state().movements[0].currency).toBe("");
  })

  it('Updates state when MovementInputs changeHandler is called', () => {
    const newState = {account: 1, quantity: 2, currency: 3};
    formComponent.find(MovementInputs).at(0).instance().getOnChangeCallback()(
      newState
    );
    expect(formComponent.state().movements[0]).toBe(newState);
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
