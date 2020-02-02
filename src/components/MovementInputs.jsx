import * as R from 'ramda';
import * as RU from '../ramda-utils.js';
import React, { Component, Fragment } from 'react';
import { newGetter } from '../utils';
import AccountInput from './AccountInput';
import CurrencyInput from './CurrencyInput';
import { ACC_TYPES } from '../constants';
import InputWrapper, { propLens as InputWrapperLens } from './InputWrapper';
import * as utils from '../utils';

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
    const props = RU.objFromPairs(
      InputWrapperLens.label, "Account",
      InputWrapperLens.content, input,
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
      <Fragment>
        <CurrencyInput currencies={currencies} onChange={onChange} value={value} />
        <CurrencyActionButtons currencyActionButtonsOpts={this.props.currencyActionButtonsOpts} />
      </Fragment>
    );
    const props = RU.objFromPairs(
      InputWrapperLens.label, "Currency",
      InputWrapperLens.content, input,
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
    const props = RU.objFromPairs(
      InputWrapperLens.label, "Quantity",
      InputWrapperLens.content, input,
    );
    return <InputWrapper {...props} />;        
  }

  render() {
    const { title } = this.props;
    const accountInput = this.renderAccountInput();
    const currencyRow = this.renderCurrencyInput();
    const quantityRow = this.renderQuantityInput();
    const inputs = <div>{accountInput}{currencyRow}{quantityRow}</div>;
    const inputWrapperProps = RU.objFromPairs(
      InputWrapperLens.content, inputs,
      InputWrapperLens.label, title,
    );
    return <InputWrapper {...inputWrapperProps} />;
  }
};

/**
 * Component with a single action button for currency.
 */
export function CurrencyActionButton({ label, onClick }) {
  return (
    <button className="currency-action-button" onClick={utils.withEventPrevention(onClick)}>
      {label}
    </button>
  );
}

/**
 * Component with all action buttons for the currency input.
 */
export function CurrencyActionButtons({ currencyActionButtonsOpts }) {
  if (R.isNil(currencyActionButtonsOpts)) return null;
  const currencyActionButtons = RU.mapIndexed(
    x => <CurrencyActionButton {...x} key={x.label} />,
    currencyActionButtonsOpts
  );
  return <div className="currency-action-buttons">{currencyActionButtons}</div>;
}
