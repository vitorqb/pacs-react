import * as R from 'ramda';
import React, { Component } from 'react';
import { createTitle, newGetter } from '../utils';
import AccountInput from './AccountInput';
import CurrencyInput from './CurrencyInput';
import { ACC_TYPES } from '../constants';

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

  render() {
    const { title, accounts=[], currencies=[] } = this.props;
    const movementSpec = this.props.value || {};

    const getAccount = newGetter(R.prop("pk"), accounts);
    const getCurrency = newGetter(R.prop("pk"), currencies);

    const titleSpan = createTitle(title);

    const makeRow = (label, component) => (
      <tr><td>{label}</td><td style={{width: "100%"}}>{component}</td></tr>
    );

    const accountRow = makeRow(
      "Account:",
      <AccountInput
        accounts={R.filter(this.accountCanHaveMovement, accounts)}
        onChange={
          this.handleChange(R.lensProp("account"), R.prop("pk"))
        }
        value={getAccount(movementSpec.account)} />
    );

    const currencyRow = makeRow(
      "Currency:",
      <CurrencyInput
        currencies={currencies}
        onChange={
          this.handleChange(R.lensPath(["money", "currency"]), R.prop("pk"))
        }
        value={getCurrency(R.path(["money", "currency"], movementSpec))} />
    );

    const quantityRow = makeRow(
      "Quantity:",
      <input
        name="quantity"
        onChange={this.handleChange(
          R.lensPath(["money", "quantity"]),
          R.path(["target", "value"])
        )}
        value={R.pathOr("", ["money", "quantity"], movementSpec)} />
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
    );
  }
};
