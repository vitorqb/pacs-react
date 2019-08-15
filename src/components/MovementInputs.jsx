import * as R from 'ramda';
import * as RU from '../ramda-utils.js';
import React, { Component } from 'react';
import { newGetter } from '../utils';
import AccountInput from './AccountInput';
import CurrencyInput from './CurrencyInput';
import { ACC_TYPES } from '../constants';
import InputWrapper, { propLens as InputWrapperLens } from './InputWrapper';

/**
 * Represents a combination of inputs for a Movement.
 */
export default class MovementInputs extends Component{

  /**
   * Returns a boolean indicating if the account can have movements
   */
  accountCanHaveMovement = (account) => account.accType === ACC_TYPES.LEAF;

  getDefaultMovementSpec() {
    return {account: "", money: { currency: "", quantity: ""} };
  }

  getMovementSpec() {
    return R.mergeDeepRight(this.getDefaultMovementSpec(), this.props.value || {});
  }

  handleChange = R.curry((lens, parseEvent, eventData) => {
    const value = parseEvent(eventData);
    const newMovementSpec = R.set(lens, value, this.getMovementSpec());
    this.props.onChange(newMovementSpec);
  })

  renderAccountInput = () => {
    const accounts = this.props.accounts || [];
    const filteredAccounts = R.filter(this.accountCanHaveMovement, accounts);
    const getAccount = newGetter(R.prop("pk"), filteredAccounts);
    const movementSpec = this.props.value || {};
    const onChange = this.handleChange(R.lensProp("account"), R.prop("pk"));
    const value = getAccount(movementSpec.account);
    const input = (
      <AccountInput accounts={filteredAccounts} onChange={onChange} value={value} />
    );
    const props = RU.setLenses(
      [[InputWrapperLens.label, "Account"], [InputWrapperLens.content, input]],
      {}
    );
    return <InputWrapper {...props} />;
  }

  renderCurrencyInput = () => {
    const movementSpec = this.props.value || {};
    const currencies = this.props.currencies || [];
    const getCurrency = newGetter(R.prop("pk"), currencies);
    const onChange = this.handleChange(R.lensPath(["money", "currency"]), R.prop("pk"));
    const value = getCurrency(R.path(["money", "currency"], movementSpec));
    const input = (
      <CurrencyInput currencies={currencies} onChange={onChange} value={value} />
    );
    const props = RU.setLenses(
      [[InputWrapperLens.label, "Currency"], [InputWrapperLens.content, input]],
      {}
    );
    return <InputWrapper {...props} />;    
  }

  renderQuantityInput = () => {
    const movementSpec = this.props.value || {};
    const value = R.pathOr("", ["money", "quantity"], movementSpec);
    const onChange = this.handleChange(
      R.lensPath(["money", "quantity"]),
      R.path(["target", "value"])
    );
    const input = (
      <input name="quantity"  onChange={onChange} value={value} />
    );
    const props = RU.setLenses(
      [[InputWrapperLens.label, "Quantity"], [InputWrapperLens.content, input]],
      {}
    );
    return <InputWrapper {...props} />;        
  }

  render() {
    const { title } = this.props;
    const accountInput = this.renderAccountInput();
    const currencyRow = this.renderCurrencyInput();
    const quantityRow = this.renderQuantityInput();
    const inputs = <div>{accountInput}{currencyRow}{quantityRow}</div>;
    const inputWrapperProps = RU.setLenses(
      [[InputWrapperLens.content, inputs], [InputWrapperLens.label, title]],
      {}
    );
    return <InputWrapper {...inputWrapperProps} />;
  }
};
