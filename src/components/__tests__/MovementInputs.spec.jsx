import * as R from 'ramda';
import sinon from 'sinon';
import React from 'react';
import MovementInputs from "../MovementInputs";
import { mount } from "enzyme";
import { AccountFactory, CurrencyFactory } from '../../testUtils';
import AccountInput from '../AccountInput';
import CurrencyInput from '../CurrencyInput';
import Select from 'react-select';

describe('MovementInputs', () => {

  describe('Mounting', () => {

    it('Mounts with title', () => {
      const title = "sadkjskadkj";
      const movementInput = mount(<MovementInputs title={title}/>);
      expect(movementInput.find("span.titleSpan").html())
        .toContain(title);
    })

    it('Mounts with all values equal to empty string', () => {
      const movementInput = mount(<MovementInputs />);
      const inputs = movementInput.find("input");
      const inputsValues = inputs.map(x => x.instance().value);
      expect(inputsValues).toEqual(["", "", ""]);
    })

    it('Contains an AccountInput with correct accounts...', () => {
      const accounts = AccountFactory.buildList(3);
      const movementInput = mount(<MovementInputs accounts={accounts} />);
      expect(movementInput.find(AccountInput)).toHaveLength(1);
      expect(movementInput.find(AccountInput).props().accounts).toBe(accounts);
      expect(movementInput.find(AccountInput).props().selectedAccount)
        .toBe(undefined);
    })

    it('Contains an CurrencyInput with correct currencies...', () => {
      const currencies = CurrencyFactory.buildList(3);
      const movementInputs = mount(<MovementInputs currencies={currencies} />);
      const curInput = movementInputs.find(CurrencyInput);
      expect(curInput).toHaveLength(1);
      expect(curInput.props().currencies).toBe(currencies);
      expect(curInput.props().selectedCurrency).toBe(undefined);
    })
    
  })

  describe('Setting input values fire events', () => {

    let movementInput;
    let onChangeHandler;
    let baseState = {
      account: "",
      currency: "",
      quantity: ""
    };

    beforeEach(() => {
      onChangeHandler = sinon.fake()
      movementInput = mount(<MovementInputs onChange={onChangeHandler}/>);
    })

    it('Change account calls handler', () => {
      const accounts = AccountFactory.buildList(5);
      movementInput = mount(
        <MovementInputs onChange={onChangeHandler} accounts={accounts} />
      );
      const selectedAcc = accounts[2];
      const accInput = movementInput.find(AccountInput);
      const expectedEmittedState = R.merge(baseState, {account: selectedAcc.pk})

      
      accInput.find(Select).props().onChange({
        value: selectedAcc
      });

      expect(onChangeHandler.calledOnceWith(expectedEmittedState)).toBe(true);
    })

    it('Set currency', () => {
      const currencies = CurrencyFactory.buildList(3);
      const currency = currencies[0];
      const movementInput = mount(
        <MovementInputs currencies={currencies} onChange={onChangeHandler} />
      );
      const curInput = movementInput.find(CurrencyInput);
      const expectedEmittedState = R.merge(baseState, {currency: currency.pk});

      curInput.props().onChange(currency)

      expect(onChangeHandler.calledWith(expectedEmittedState)).toBe(true);
    })

    it('Set quantity', () => {
      const value = 2;
      const quantityInput = movementInput.find('input[name="quantity"]');
      const expectedEmittedState = R.merge(baseState, {quantity: value});

      quantityInput.simulate("change", { target: { value } });

      expect(onChangeHandler.calledWith(expectedEmittedState)).toBe(true);
    })

  })
})
