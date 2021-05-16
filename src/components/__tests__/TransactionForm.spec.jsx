import sinon from 'sinon';
import React from 'react';
import { mount } from 'enzyme';
import TransactionForm, * as sut from '../TransactionForm';
import MovementInputs from '../MovementInputs';
import ErrorMessage from '../ErrorMessage';
import SuccessMessage from '../SuccessMessage';
import { AccountFactory, TransactionFactory } from '../../testUtils';
import { getSpecFromTransaction } from '../../utils';
import * as R from 'ramda';
import moment from 'moment';

/**
 * Uses enzyme to mount a TransactionForm
 * @param {object} props
 * @param {TransactionSpec} props.value - The value for the TransactionForm.
 * @param {string} props.title - The title.
 * @param {function(*): Promise} props.onSubmit - A function that
 *   performs an action and returns a promise.
 * @param {function(TransactionSpec): ?} props.onChange - A function that
 *   is called whenever the user chages the TransactionSpec.
 */
function mountTransactionForm(
  {
    value=undefined,
    title="",
    onSubmit=(()=>Promise.resolve({})),
    onChange=sinon.fake(),
    accounts=[],
    templatePicker=undefined
  }={}
) {
  return mount(
    <TransactionForm
      value={value}
      title={title}
      onSubmit={onSubmit}
      onChange={onChange}
      accounts={accounts}
      templatePicker={templatePicker}
    />
  );
}

// Helper functions for manipulating the component
function findReferenceInput(c) { return c.find('input[name="reference"]'); }
function simulateReferenceChange(c, value) {
  return findReferenceInput(c).props().onChange({target: {value: value}});
}

/**
 * Creates a stub for an axios promise that is rejected with an http error.
 */
function axiosReject(data) {
  const error = { response: { data } };
  return Promise.reject(error);
}

describe('TransactionForm', () => {

  let formComponent;

  beforeEach(() => {
    formComponent = mountTransactionForm();
  });

  describe('Mounting...', () => {

    it('Mounts with title', () => {
      const title = "aloha";
      const formComponent = mountTransactionForm({title});
      expect(formComponent.find("span.titleSpan").first().html()).toContain(title);
    });

    it('Mounts with templatePicker if given', () => {
      function TemplatePicker() { return <span>{"FOO"}</span>; };
      const formComponent = mountTransactionForm({templatePicker: <TemplatePicker />});
      expect(formComponent.find(TemplatePicker)).toHaveLength(1);
    });

    it('Mounts with all inputs and empty strings if no value', () => {
      const value = {};
      formComponent = mountTransactionForm({value});
      const inputNames = ["description", "date", "reference"];
      for (var i=0; i<inputNames.length; i++) {
        const name = inputNames[i];
        const input = formComponent.find(`input[name="${name}"]`);
        expect(input).toHaveLength(1);
        expect(input.instance().value).toBe("");
      }
    });

    it('Mounts with two empty states for movements if no value', () => {
      const transaction = TransactionFactory.build();
      const value = R.omit(["movements"], getSpecFromTransaction(transaction));
      
      formComponent = mountTransactionForm({value});

      expect(formComponent.find(MovementInputs)).toHaveLength(2);
      for (var i=1; i<2; i++) {
        expect(formComponent.find(MovementInputs).at(i).props().value)
          .toEqual({});
      }
    });

    it('Mounted MovementInputs have accounts', () => {
      const accounts = AccountFactory.buildList(3);
      const formComponent = mountTransactionForm({accounts});
      const movementInputsList = formComponent.find(MovementInputs);
      for (var i=0; i<movementInputsList.length; i++) {
        const movementInputs = movementInputsList.at(i);
        expect(movementInputs.props().accounts).toEqual(accounts);
      }
    });

    describe('Mounting with value...', () => {
      const transaction = TransactionFactory.build();
      const value = getSpecFromTransaction(transaction);
      const formComponent = mountTransactionForm({value});
      it('Passes value to name input...', () => {
        expect(formComponent.find('input[name="description"]').props().value)
          .toEqual(value.description);
      });
      it('Passes date to date input...', () => {
        expect(formComponent.find('DateInput').props().value)
          .toEqual(transaction.date.format("YYYY-MM-DD"));
      });
      it('Passes movements to movements inputs...', () => {
        const movementInputsArray = formComponent.find(MovementInputs);
        expect(movementInputsArray).toHaveLength(value.movements.length);
        for (var i=0; i<movementInputsArray.length; i++) {
          const movementInput = movementInputsArray.at(i);
          const movementSpec = value.movements[i];
          expect(movementInput.props().value).toBe(movementSpec);
        }
      });
      it('Passes reference to reference input', () => {
        expect(findReferenceInput(formComponent).props().value)
          .toEqual(transaction.reference);
      });
    });
  });

  describe('Updating...', () => {
    let onChange;
    beforeEach(() => {
      onChange = sinon.fake();
      formComponent = mountTransactionForm({onChange});
    });

    it('Calls onChange when MovementInputs changes...', () => {
      const movementSpec = {account: 1, money: {quantity: 2, currency: 3}};
      formComponent.find(MovementInputs).at(1).props().onChange(movementSpec);
      expect(onChange.lastArg.movements[1]).toEqual(movementSpec);
    });

    it('Calls onChange when description changes...', () => {
      const newDescription = "hasadslads";
      formComponent
        .find('input[name="description"]')
        .props()
        .onChange({target: {value: newDescription}});
      expect(onChange.lastArg.description).toEqual(newDescription);
    });

    it('Calls onChange when date changes...', () => {
      const newUserInput = "2022-01-01";
      const newDate = moment.utc(newUserInput);
      const changeEvent = {userInput: newUserInput, pickedDate: newDate};
      formComponent.find('DateInput').props().onChange(changeEvent);
      expect(onChange.lastArg.date).toEqual(newDate);
    });

    it('Calls onChange when date changes (null value)...', () => {
      const newUserInput = "2022-01-";
      const newDate = null;
      const changeEvent = {userInput: newUserInput, pickedDate: newDate};
      formComponent.find('DateInput').props().onChange(changeEvent);
      expect(onChange.lastArg.date).toEqual(null);
    });

    it('Calls onChange when reference changes...', () => {
      const newRef = "foo bar baz";
      simulateReferenceChange(formComponent, newRef);
      expect(onChange.callCount).toEqual(1);
      expect(onChange.lastArg.reference).toEqual(newRef);
    });
  });

  describe('Adding/Removing movement inputs...', () => {
    it('Can render three MovementInputs in the DOM.', () => {
      formComponent = mountTransactionForm({value: {movements: [{}, {}, {}]}});
      expect(formComponent.find(MovementInputs)).toHaveLength(3);
    });
    describe('Adds a new movement.', () => {
      beforeEach(() => {
        formComponent = mountTransactionForm();
        formComponent.find('button[name="add-movement"]').props().onClick({
          preventDefault: ()=>{}
        });
        formComponent.update();
      });
      it('Calls onChange with new MovementInputs.', () => {
        expect(formComponent.props().onChange.calledOnce).toBe(true);
        const expNewState = R.set(
          R.lensPath(["movements", 2]),
          {},
          formComponent.instance().getValue()
        );
        expect(formComponent.props().onChange.lastCall.args)
          .toEqual([expNewState]);
      });
      it('Calls onChange when changing added movement input.', () => {
        const movementSpec = {quantity: 12};
        formComponent = mountTransactionForm({value: {movements: [{}, {}, {}]}});
        const expNewTransactionSpec = {movements: [{}, {}, movementSpec]};
        formComponent.find(MovementInputs).at(2).props().onChange(movementSpec);
        expect(formComponent.props().onChange.lastCall.args)
          .toEqual([expNewTransactionSpec]);
      });
      it('Can be removed.', () => {
        formComponent = mountTransactionForm(
          {value: {movements: [{quantity: 1}, {quantity: 2}, {}]}}
        );
        formComponent.find('button[name="remove-movement-2"]').props().onClick({
          preventDefault: ()=>{}
        });
        expect(formComponent.props().onChange.lastCall.args)
          .toEqual([{movements: [{quantity: 1}, {quantity: 2}]}]);
      });
      it('Removal button dont exist for two first movements.', () => {
        [0,1].forEach(i => {
          expect(formComponent.find(`button[name="remove-movement-${i}"]`))
            .toHaveLength(0);
        });
      });
    });
  });

  describe('Submitting...', () => {

    let onSubmit, value;

    function simulateSubmit(f) {
      return f.instance().handleSubmit({preventDefault: ()=>{}});
    }

    function getSuccessMsgValue(f) {
      return f.find(SuccessMessage).props().value;
    }

    beforeEach(() => {
      value = getSpecFromTransaction(TransactionFactory.build());
      onSubmit = sinon.fake.resolves();
      formComponent = mountTransactionForm({value, onSubmit});
    });

    it('Calls onSubmit with transactionSpec when submit.', () => {
      formComponent.find('form').simulate("submit");
      const calledArg = onSubmit.lastCall.args[0];
      expect(onSubmit.calledOnce).toBe(true);
      expect(calledArg).toEqual(value);
    });

    it('Calls handleSubmit on submit', () => {
      expect(formComponent.instance().handleSubmit).toBeTruthy();
      formComponent.instance().handleSubmit = sinon.fake();
      formComponent.instance().forceUpdate();
      formComponent.find("form").update();

      formComponent.find("form").simulate("submit");

      expect(formComponent.instance().handleSubmit.calledOnce).toBe(true);
    });

    it('Parses responseMessage to SuccessMessage', async () => {
      const responseMsg = {some: "message"};
      const onSubmit = () => Promise.resolve(responseMsg);
      formComponent = mountTransactionForm({onSubmit});

      expect(getSuccessMsgValue(formComponent)).toBe("");

      await simulateSubmit(formComponent);
      formComponent.update();

      expect(getSuccessMsgValue(formComponent)).toEqual(responseMsg);
    });

    it('Resets submitted response msg on resubmition', () => {
      const responseMsg = {some: "message"};
      var mockFirstCall = true;
      function onSubmit() {
        if (mockFirstCall) {
          mockFirstCall = false;
          return Promise.resolve(responseMsg);
        }
        return Promise.reject();
      }
      formComponent = mountTransactionForm({onSubmit});
      simulateSubmit(formComponent);
      simulateSubmit(formComponent);
      expect(getSuccessMsgValue(formComponent)).toEqual("");
    });

  });

  describe('Erroring...', () => {

    let onSubmit;

    function getErrorMessage() {
      return formComponent.find(ErrorMessage);
    }

    function getErrorMessage_div() {
      return getErrorMessage().find("div");
    }

    function simulateSubmit() {
      const fakeEvent = {preventDefault: () => {}};
      return formComponent.instance().handleSubmit(fakeEvent);
    }

    beforeEach(() => {
      onSubmit = sinon.fake();
      formComponent = mountTransactionForm({onSubmit});
    });

    it('Renders with empty ErrorMessage...', () => {
      expect(getErrorMessage()).toHaveLength(1);
      expect(getErrorMessage().instance().hasError()).toBe(false);
    });

    it('Passes error message to ErrorMessage children...', () => {
      expect(getErrorMessage().props().value).toBeFalsy();
      const errorJson = { account: "This field can not be null!" };
      formComponent.setState({errorMessage: errorJson});
      formComponent.render();
      expect(getErrorMessage().props().value).toBe(errorJson);
    });

    it('Set error message on request failure...', async () => {
      const errorJson = { account: "This field can not be null!" };
      const failedPromise = Promise.reject(errorJson);
      onSubmit = () => failedPromise;

      formComponent = mountTransactionForm({onSubmit});
      await simulateSubmit();

      expect(formComponent.state().errorMessage).toBe(errorJson);

      getErrorMessage().update();
      expect(getErrorMessage().instance().hasError()).toBe(true);
      expect(getErrorMessage().props().value).toBe(errorJson);
    });

    it('Displays error message from state...', () => {
      formComponent.setState({ errorMessage: "My Error" });
      expect(getErrorMessage_div().html()).toContain("My Error");
    });

    it('Resets error message on new submit...', async () => {
      var callCount = 0;
      const erroredPromise = axiosReject({data: "Err"}).catch(e => {
        throw e.response;
      });
      onSubmit = () => {
        if (callCount === 0) {
          callCount++;
          return erroredPromise;
        }
        return Promise.resolve();
      };
      formComponent = mountTransactionForm({onSubmit});

      await simulateSubmit();

      getErrorMessage().update();
      expect(getErrorMessage().props().value).toBeTruthy();

      await simulateSubmit();

      getErrorMessage().update();
      expect(getErrorMessage().props().value).not.toBeTruthy();
    });

  });

});

describe('getCurrencyActionButtonsOpts', () => {

  it('Empty if it is last movement', () => {
    const movementSpec = {id: 1};
    const movements = [movementSpec];
    const index = 0;
    expect(sut.getCurrencyActionButtonsOpts(movementSpec, index, movements)).toEqual([]);
  });

  it('Not empty if it is not last movement', () => {
    const movementSpec = {account: 1};
    const movements = [movementSpec, {account: 2}];
    const index = 0;
    const result = sut.getCurrencyActionButtonsOpts(movementSpec, index, movements);
    expect(result).toHaveLength(1);
  });
  
});

describe('Is last movement', () => {

  it('True (two long)', () => {
    expect(sut.isLastMovement(0, [{id: 1}])).toBe(true);
  });

  it('False', () => {
    expect(sut.isLastMovement(1, [{id: 1}, {id: 2}, {id: 3}])).toBe(false);
  });
  
});

describe('copyCurrencyToNextMovementSpec', () => {

  it('Base', () => {
    const movement1 = {money: {currency: 1}};
    const movement2 = {money: {currency: 2}};
    const movements = [movement1, movement2];
    expect(sut.copyCurrencyToNextMovementSpec(movement1, 0, movements))
      .toEqual([movement1, {money: {currency: 1}}]);
  });

  it('Empty movement spec', () => {
    const movement1 = {};
    const movement2 = {money: {currency: 3}};
    const movements = [movement1, movement2];
    expect(sut.copyCurrencyToNextMovementSpec(movement1, 0, movements))
      .toEqual([movement1, {money: {currency: null}}]);
  });
  
});

describe('copyQuantityToNextMovementSpec', () => {

  it('Base', () => {
    const movement1 = {money: {quantity: 1}};
    const movement2 = {money: {quantity: 2}};
    const movements = [movement1, movement2];
    expect(sut.copyQuantityToNextMovementSpec(movement1, 0, movements))
      .toEqual([movement1, {money: {quantity: -1}}]);
  });

  it('Base', () => {
    const movement1 = {};
    const movement2 = {money: {quantity: 2}};
    const movements = [movement1, movement2];
    expect(sut.copyQuantityToNextMovementSpec(movement1, 0, movements))
      .toEqual([movement1, {money: {quantity: null}}]);
  });
  
});
