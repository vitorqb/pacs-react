import * as R from 'ramda';
import sinon from 'sinon';
import React from 'react';
import MovementInputs from "../MovementInputs";
import { mount } from "enzyme";


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
      const value = 12;
      const accInput = movementInput.find('input[name="account"]');
      const expectedEmittedState = R.merge(baseState, {account: value})
      
      accInput.simulate("change", { target: { value } });

      expect(onChangeHandler.calledOnceWith(expectedEmittedState)).toBe(true);
    })

    it('Set currency', () => {
      const value = 22;
      const curInput = movementInput.find('input[name="currency"]');
      const expectedEmittedState = R.merge(baseState, {currency: value});

      curInput.simulate("change", { target: { value } });

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
