import React, { Component, createElement } from 'react';
import MonthPicker from './MonthPicker';
import AccountInput from './AccountInput';
import AccountBalanceEvolutionTable from './AccountBalanceEvolutionTable';
import { MonthUtil, newGetter } from '../utils';
import * as R from 'ramda';

export default class AccountBalanceEvolutionComponent extends Component {

  constructor(props) {
    super(props);
    this.state = {
      pickedMonths: [null, null],
      // !!!! TODO -> Should be able to pick as many accounts as we want.
      pickedAccounts: [null, null]
    };
  }

  handlePickedMonth = R.curry((i, newValue) => {
    this.setState(R.assocPath(["pickedMonths", i], newValue));
  })

  handleAccountInputValueChange = R.curry((i, newValue) => {
    this.setState(R.assocPath(["pickedAccounts", i], newValue));
  })

  setAccountBalanceEvolutionData = (x) => {
    this.setState(R.assoc("data", x));
  }

  handleSubmit = (inject=undefined) => {
    // Dep injection
    const _inject = inject || this.props.inject || {};
    const _validateMonths = _inject.validateMonths || validateMonths;
    const _validateAccounts = _inject.validateAccounts || validateAccounts;
    const _alert = _inject.alert || alert;
    const { pickedMonths, pickedAccounts } = this.state;

    const errorMsg = R.find(
      R.complement(R.isNil),
      [_validateMonths(pickedMonths), _validateAccounts(pickedAccounts)]
    );
    if (errorMsg) {
      _alert(errorMsg);
      return Promise.resolve();
    };

    return this
      .props
      .getAccountBalanceEvolutionData(pickedAccounts, pickedMonths)
      .then(this.setAccountBalanceEvolutionData)
      .catch(() => alert('Request failed!'));
  };

  render(props) {
    const { pickedMonths, pickedAccounts, data } = this.state;
    const { accounts, getCurrency } = this.props;
    const getAccount = newGetter(R.prop("pk"), accounts);
    const monthPickers = makeMonthPickers(pickedMonths, this.handlePickedMonth);
    const accountInputs = makeAccountInputs(
      accounts,
      pickedAccounts,
      this.handleAccountInputValueChange
    );
    const accountBalanceEvolutionTable = makeAccountBalanceEvolutionTable(
      data, getCurrency, getAccount
    );
    return (
      <div>
        {monthPickers}
        {accountInputs}
        <button onClick={this.handleSubmit}>Submit!</button>
        <div>
          {accountBalanceEvolutionTable}
        </div>
      </div>
    );
  }
}


/**
 * Returns two MonthPickers for the component
 */
export function makeMonthPickers(values, onPicked, inject={}) {
  const _MonthPicker = inject.MonthPicker || MonthPicker;
  const _createElement = inject.createElement || createElement;
  return R.addIndex(R.map)(
    (value, i) => _createElement(
      _MonthPicker,
      { key: i, value, onPicked: onPicked(i) }
    ),
    values
  );
};


/**
 * Returns AccountInput[] for the component.
 */
export function makeAccountInputs(accounts, values, onChange, inject={}) {
  const _AccountInput = inject.AccountInput || AccountInput;
  const _createElement = inject.createElement || createElement;

  return R.addIndex(R.map)(
    (value, i) => _createElement(
      _AccountInput,
      { key: i, accounts, value,  onChange: onChange(i) }
    ),
    values
  );
};

export function makeAccountBalanceEvolutionTable(
  data,
  getCurrency,
  getAccount,
  inject={}
) {
  const _AccountBalanceEvolutionTable = (
    inject.AccountBalanceEvolutionTable || AccountBalanceEvolutionTable
  );
  const _createElement = inject.createElement || createElement;
  
  if (R.isNil(data)) {
    return null;
  }
  return _createElement(
    _AccountBalanceEvolutionTable,
    {
      monthsLabels: R.pipe(
        R.apply(MonthUtil.monthsBetween),
        R.map(MonthUtil.toLabel)
      )(data.months),
      data: data.data,
      getCurrency,
      getAccount
    }
  );
};

/**
 * Validates that the start and end months make sense
 */
export function validateMonths(months) {
  const { getMonthIndex, getMonthAsNumber } = MonthUtil;

  if (R.any(R.isNil, months)) {
    return MONTH_VALIDATION_ERRORS.IS_NULL;
  }
  const unkownMonth = R.find(R.pipe(getMonthIndex, R.equals(-1)), months);
  if (unkownMonth) {
    return MONTH_VALIDATION_ERRORS.UNKOWN_MONTH(unkownMonth);
  }
  if (getMonthAsNumber(months[0]) >= getMonthAsNumber(months[1])) {
    return MONTH_VALIDATION_ERRORS.INVALID_ORDER;
  };
  return null;
};

/**
 * Validates that the accounts chosen make sense
 */
export function validateAccounts(accounts) {
  if (R.any(R.isNil, accounts)) {
    return ACCOUNT_VALIDATION_ERRORS.IS_NULL;
  }
  if (accounts.length < 1) {
    return ACCOUNT_VALIDATION_ERRORS.EMPTY;
  }
  return null;
};

export const ACCOUNT_VALIDATION_ERRORS = {
  IS_NULL: "At least one of the accounts is not set!",
  EMPTY: "At least one account is needed."
};

export const MONTH_VALIDATION_ERRORS = {
  INVALID_ORDER: "The second date appears to come before (or is equal to) the first.",
  IS_NULL: "At least one of the months is null!",
  UNKOWN_MONTH: x => `Unkown month ${JSON.stringify(x)}`
};
