import sinon from 'sinon';
import * as R from 'ramda';
import React from 'react';
import { mount } from 'enzyme';
import CreateTransactionForm from '../CreateTransactionForm';
import MovementInputs from '../MovementInputs';
import ErrorMessage from '../ErrorMessage';
import SuccessMessage from '../SuccessMessage';

/**
 * Uses enzyme to mount a CreateTransactionForm
 * @param {string} props.title - The title.
 */
function mountCreateTransactionForm(
  { title="", createTransactionMock=(()=>Promise.resolve({})) }={}
) {
  return mount(
    <CreateTransactionForm title={title} createTransaction={createTransactionMock} />
  )
}

/**
 * Creates a stub for an axios promise that is rejected with an http error.
 */
function axiosReject(data) {
  const error = { response: { data } };
  return Promise.reject(error)
}

describe('CreateTransactionForm', () => {

  let formComponent;

  beforeEach(() => {
    formComponent = mountCreateTransactionForm();
  })

  describe('Mounting...', () => {

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

  })

  describe('Updating...', () => {

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

  describe('Submitting...', () => {

    let createTransactionMock;

    function simulateSubmit(f) {
      return f.instance().handleSubmit({preventDefault: ()=>{}});
    }

    function getSuccessMsgValue(f) {
      return f.find(SuccessMessage).props().value
    }

    beforeEach(() => {
      createTransactionMock = sinon.fake.resolves();
      formComponent = mountCreateTransactionForm({createTransactionMock});
    })

    it('Calls createTransactionMock when submitted', () => {
      formComponent.find('form').simulate("submit");
      expect(createTransactionMock.calledOnce).toBe(true);
    })

    it('Parses transaction data in state to createTransaction', () => {
      const state = {
        description: 1,
        date: "2018-01-01",
        movements: [{account: 1, currency: 2, quantity: 3}]
      };
      formComponent.setState(state);
      formComponent.find('form').simulate("submit");
      const calledArg = createTransactionMock.lastCall.args[0];
      expect(calledArg).toEqual(state);
    })

    it('Calls handleSubmit on submit', () => {
      expect(formComponent.instance().handleSubmit).toBeTruthy();
      formComponent.instance().handleSubmit = sinon.fake();
      formComponent.instance().forceUpdate();
      formComponent.find("form").update();

      formComponent.find("form").simulate("submit");

      expect(formComponent.instance().handleSubmit.calledOnce).toBe(true);
    })

    it('Parses responseMessage to SuccessMessage', async () => {
      const responseMsg = {some: "message"};
      const createTransactionMock = () => Promise.resolve(responseMsg)
      formComponent = mountCreateTransactionForm({createTransactionMock})

      expect(getSuccessMsgValue(formComponent)).toBe("");

      await simulateSubmit(formComponent)
      formComponent.update()

      expect(getSuccessMsgValue(formComponent)).toEqual(responseMsg);
    })
    
    it('Resets submitted response msg on resubmition', () => {
      const responseMsg = {some: "message"};
      var mockFirstCall = true;
      function createTransactionMock() {
        if (mockFirstCall) {
          mockFirstCall = false;
          return Promise.resolve(responseMsg);
        }
        return Promise.reject()
      }
      formComponent = mountCreateTransactionForm({createTransactionMock});
      simulateSubmit(formComponent)
      simulateSubmit(formComponent)
      expect(getSuccessMsgValue(formComponent)).toEqual("");
    })

  })

  describe('Erroring...', () => {

    let createTransactionMock;

    function getErrorMessage() {
      return formComponent.find(ErrorMessage)
    }

    function getErrorMessage_div() {
      return getErrorMessage().find("div")
    }

    function simulateSubmit() {
      const fakeEvent = {preventDefault: () => {}};
      return formComponent.instance().handleSubmit(fakeEvent);
    }

    beforeEach(() => {
      createTransactionMock = sinon.fake();
      formComponent = mountCreateTransactionForm({createTransactionMock});
    })

    it('Renders with empty ErrorMessage...', () => {
      expect(getErrorMessage()).toHaveLength(1);
      expect(getErrorMessage().instance().hasError()).toBe(false);
    })

    it('Passes error message to ErrorMessage children...', () => {
      expect(getErrorMessage().props().value).toBeFalsy();
      const errorJson = { account: "This field can not be null!" };
      formComponent.setState({errorMessage: errorJson});
      formComponent.render();
      expect(getErrorMessage().props().value).toBe(errorJson);
    })

    it('Set error message on request failure...', async () => {
      const errorJson = { account: "This field can not be null!" };
      const failedPromise = Promise.reject(errorJson);
      createTransactionMock = () => failedPromise;

      formComponent = mountCreateTransactionForm({createTransactionMock});
      await simulateSubmit()

      expect(formComponent.state().errorMessage).toBe(errorJson);

      getErrorMessage().update()
      expect(getErrorMessage().instance().hasError()).toBe(true);
      expect(getErrorMessage().props().value).toBe(errorJson);
    })

    it('Displays error message from state...', () => {
      formComponent.setState({ errorMessage: "My Error" });
      expect(getErrorMessage_div().html()).toContain("My Error");
    })

    it('Resets error message on new submit...', async () => {
      var callCount = 0;
      const erroredPromise = axiosReject({data: "Err"}).catch(e => {
        throw e.response
      });
      createTransactionMock = () => {
        if (callCount === 0) {
          callCount++;
          return erroredPromise
        }
        return Promise.resolve()
      }
      formComponent = mountCreateTransactionForm({createTransactionMock});

      await simulateSubmit();

      getErrorMessage().update()
      expect(getErrorMessage().props().value).toBeTruthy()

      await simulateSubmit();

      getErrorMessage().update()
      expect(getErrorMessage().props().value).not.toBeTruthy()
    })
    
  })
  
})
