import * as R from 'ramda';
import React, { Component } from 'react';
import { createTitle } from '../utils';
import AccountInput from './AccountInput';
import CurrencyInput from './CurrencyInput';

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
   * Extracts a value from an event and inputName.
   */
  extractEventValue(inputName, event) {
    switch(inputName){
    case "account":
      // event == {label: string, value: Account}
      return event.value.pk;
    case "currency":
      // event == currency
      return event.pk
    default:
      const rawValue = event.target.value;
      return rawValue;
    }
  }

  /**
   * A curried function that handle changes for a specific input,
   * specified by name, that has been changed to a new value.
   */
  changeHandler = (inputName) => (event) => {
    const newValue = this.extractEventValue(inputName, event);
    const oldInputValues = this.getInputValues();
    const newInputValues = R.merge(oldInputValues, R.objOf(inputName, newValue));
    this.getOnChangeCallback()(newInputValues);
  }

  render() {
    const { title, accounts=[], currencies=[] } = this.props;
    const titleSpan = createTitle(title);
    const makeRow = (label, component) => (
      <tr><td>{label}</td><td style={{width: "100%"}}>{component}</td></tr>
    )
    const accountRow = makeRow(
      "Account:",
      <AccountInput
        accounts={accounts}
        onChange={this.changeHandler("account")} />
    );
    const currencyRow = makeRow(
      "Currency:",
      <CurrencyInput
        currencies={currencies}
        onChange={this.changeHandler("currency")} />
    );
    const quantityRow = makeRow(
      "Quantity:",
      <input name="quantity" onChange={this.changeHandler("quantity")}/>
    );
    return (
      <div>
        {titleSpan}
        <table style={{width: "100%"}}><tbody>
            {accountRow}
            {currencyRow}
            {quantityRow}
        </tbody></table>
      </div>
    )
  }
};
