import * as R from 'ramda';
import { Map, List } from 'immutable';
import React, { Component } from 'react';
import { createTitle } from '../utils';

/**
 * Represents a combination of inputs for a Movement.
 */
export default class MovementInputs extends Component{

  /**
   * Returns the callback for onChange, called with the new
   * state.
   */
  getOnChangeCallback() {
    return this.props.onChange || (() => {});
  }

  /**
   * Returns the default values for inputs.
   */
  getInputDefaultValues() {
    return {account: "", currency: "", quantity: ""}
  }

  /**
   * Returns the values for inputs.
   */
  getInputValues() {
    const updateWithProps = R.mapObjIndexed((x, k) => this.props[k] || x)
    return updateWithProps(this.getInputDefaultValues())
  }

  /**
   * A curried function that handle changes for a specific input,
   * specified by name, that has been changed to a new value.
   */
  changeHandler = (inputName) => {
    return (event) => {
      const newValue = event.target.value;
      const oldInputValues = this.getInputValues();
      const newInputValues= R.merge(oldInputValues, R.objOf(inputName, newValue));
      this.getOnChangeCallback()(newInputValues);
    }
  }

  render() {
    const { title } = this.props;
    const titleSpan = createTitle(title);
    return (
      <div>
        {titleSpan}
        <input name="account" onChange={this.changeHandler("account")}/>
        <input name="currency" onChange={this.changeHandler("currency")} />
        <input name="quantity" onChange={this.changeHandler("quantity")}/>
      </div>
    )
  }
};
