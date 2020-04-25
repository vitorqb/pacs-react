import * as R from 'ramda';
import sinon from 'sinon';
import React from 'react';
import MovementInputs, * as sut from "../MovementInputs";
import { mount } from "enzyme";
import { memoizeSimple } from '../../utils.jsx';
import { AccountFactory, CurrencyFactory } from '../../testUtils';
import AccountInput from '../AccountInput';
import CurrencyInput from '../CurrencyInput';
import { ACC_TYPES } from '../../constants.js';

/**
 * Mounts a MovementInputs for testing.
 * @param {object} [options]
 * @param {MovementSpec} [options.value] - A MovementSpec with the values.
 * @param {Account[]} [options.accounts]
 * @param {Currency[]} [options.currencies]
 */
function mountMovementInputs({value={}, accounts=[], currencies=[]}={}) {
  return mount(
    <MovementInputs value={value} accounts={accounts} currencies={currencies} />
  );
}

describe('MovementInputs', () => {

  describe('Mounting', () => {

    it('Mounts with title', () => {
      const title = "sadkjskadkj";
      const movementInput = mount(<MovementInputs title={title}/>);
      expect(movementInput.find("InputWrapper").first().props().label).toContain(title);
    });

    it('Mounts with all values equal to empty string', () => {
      const movementInput = mount(<MovementInputs />);
      const inputs = movementInput.find("input");
      const inputsValues = inputs.map(x => x.instance().value);
      expect(inputsValues).toEqual(["", "", ""]);
    });

    it('Contains an AccountInput with correct accounts...', () => {
      // Only leaf accounts should stay
      const leafAccounts = AccountFactory.buildList(2, {accType: ACC_TYPES.LEAF});
      const rootAccount = AccountFactory.buildRoot();
      const branchAccount = AccountFactory.buildBranch();
      const accounts = R.concat([branchAccount, rootAccount], leafAccounts);
      const movementInput = mount(<MovementInputs accounts={accounts} />);
      expect(movementInput.find(AccountInput)).toHaveLength(1);
      expect(movementInput.find(AccountInput).props().accounts).toEqual(leafAccounts);
      expect(movementInput.find(AccountInput).props().value).toBe(undefined);
    });

    it('Contains an CurrencyInput with correct currencies...', () => {
      const currencies = CurrencyFactory.buildList(3);
      const movementInputs = mount(<MovementInputs currencies={currencies} />);
      const curInput = movementInputs.find(CurrencyInput);
      expect(curInput).toHaveLength(1);
      expect(curInput.props().currencies).toBe(currencies);
      expect(curInput.props().selectedCurrency).toBe(undefined);
    });

    it('Maps quantity in value to quantity input value', () => {
      const value = {money: {quantity: 1}};
      const movementInputs = mountMovementInputs({value});
      expect(movementInputs.find('input[name="quantity"]').props().value)
        .toBe(value.money.quantity);
    });

    it('Maps account in value to account input value', () => {
      const getAccount = memoizeSimple(pk => AccountFactory.build({pk}));
      const value = {account: 2};
      const accounts = [getAccount(2)];
      const movementInputs = mountMovementInputs({value, accounts});
      expect(movementInputs.find(AccountInput).props().value).toBe(getAccount(2));
    });

    it('Maps currency in value to currency input value', () => {
      const getCurrency = memoizeSimple(pk => CurrencyFactory.build({pk}));
      const value = {money: {currency: 33}};
      const currencies = [getCurrency(33)];
      const movementInputs = mountMovementInputs({value, currencies});
      expect(movementInputs.find(CurrencyInput).props().value).toBe(getCurrency(33));
    });
  });

  describe('Setting input values fire events', () => {

    let movementInput;
    let onChangeHandler;
    let baseState = sut.getDefaultMovementSpec();

    beforeEach(() => {
      onChangeHandler = sinon.fake();
      movementInput = mount(<MovementInputs onChange={onChangeHandler}/>);
    });

    /**
     * Expands the `comment` input for the input.
     */
    function expandComment() {
      const button = movementInput.find('CommentInput').find('button');
      button.simulate('click');
    }

    it('Change account calls handler', () => {
      const accounts = AccountFactory.buildList(5);
      movementInput = mount(
        <MovementInputs onChange={onChangeHandler} accounts={accounts} />
      );
      const selectedAcc = accounts[2];
      const accInput = movementInput.find(AccountInput);
      const expectedEmittedState = R.merge(baseState, {account: selectedAcc.pk});

      accInput.props().onChange(selectedAcc);

      expect(onChangeHandler.calledOnceWith(expectedEmittedState)).toBe(true);
    });

    it('Set currency', () => {
      const currencies = CurrencyFactory.buildList(3);
      const currency = currencies[0];
      const movementInput = mount(
        <MovementInputs currencies={currencies} onChange={onChangeHandler} />
      );
      const curInput = movementInput.find(CurrencyInput);
      const expectedEmittedState = R.mergeDeepRight(
        baseState,
        {money: {currency: currency.pk}}
      );

      curInput.props().onChange(currency);

      expect(onChangeHandler.calledWith(expectedEmittedState)).toBe(true);
    });

    it('Set quantity', () => {
      const value = 2;
      const quantityInput = movementInput.find('input[name="quantity"]');
      const expectedEmittedState = R.mergeDeepRight(
        baseState,
        {money: {quantity: value}}
      );

      quantityInput.simulate("change", { target: { value } });

      expect(onChangeHandler.calledWith(expectedEmittedState)).toBe(true);
    });

    it('Set comment', () => {

      expandComment();

      const value = "foo";
      const commentTextArea = movementInput.find('textarea[name="comment"]');
      const expectedEmittedState = R.mergeDeepRight(baseState, {comment: value});

      commentTextArea.simulate("change", { target: { value } });

      expect(onChangeHandler.args[0][0]).toEqual(expectedEmittedState);
    });

  });
});

describe('renderCurrencyActionButtons', () => {

  it('Null if no currencyActionButtonOpts', () => {
    expect(sut.CurrencyActionButtons({})).toBe(null);
  });

  it('Renders a div when not null', () => {
    const currencyActionButtonsOpts = [{label: "Foo"}];
    const result = mount(sut.CurrencyActionButtons({currencyActionButtonsOpts}));
    expect(result.find(".currency-action-buttons")).toHaveLength(1);
  });

});

describe('QuantityActionButton', () => {

  it('Base', () => {
    const label = "Foo";
    const onClick = () => "BAR";
    const result = mount(
      <sut.QuantityActionButton {...{label, onClick}} />
    );
    expect(result.find(".currency-action-button")).toHaveLength(1);
    expect(result.text()).toEqual(label);
    expect(result.props().onClick()).toEqual(onClick());
  });

});

describe('QuantityActionButtons', () => {

  it('Base', () => {
    const label = "Foo";
    const onClick = () => "BAR";
    const quantityActionButtonsOpts = [{label, onClick}];
    const result = mount(<sut.QuantityActionButtons {...{quantityActionButtonsOpts}} />);

    expect(result.find(".quantity-action-buttons")).toHaveLength(1);
    expect(result.find(".currency-action-button")).toHaveLength(1);
    expect(result.find(".currency-action-button").at(0).text()).toEqual(label);
  });

});

describe('CommentInput', () => {

  let value, onChange, component;

  beforeEach(() => {
    value = "FOO";
    onChange = sinon.fake();
    component = mount(<sut.CommentInput value={value} onChange={onChange} />);
  });

  /**
   * Expands the `comment` input for the input.
   */
  function expandComment() { component.find('button').simulate('click'); }

  /**
   * Counts the number of textarea found inside the component.
   */
  function countTextareas() { return component.find('textarea').length; }

  /**
   * Simulates a user typing on the textarea.
   */
  function simulateUserType(typedVal) {
    component.find('textarea').simulate('change', {target: {value: typedVal}});
  };

  it('Textarea is collapsed by default', () => {
    expect(countTextareas()).toEqual(0);
  });

  it('Textarea is expanded by button click', () => {
    expandComment();
    expect(countTextareas()).toEqual(1);
  });

  it('Passes value', () => {
    expect(component.props().value).toEqual(value);
  });

  it('Calls onChange when the value change', () => {
    expandComment();
    simulateUserType('BAR');
    expect(onChange.args[0][0]).toEqual('BAR');
  });

});
