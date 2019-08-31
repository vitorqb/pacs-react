import React, { Component, createElement } from 'react';
import MonthPicker from './MonthPicker';
import AccountBalanceEvolutionTable from './AccountBalanceEvolutionTable';
import MultipleAccountsSelector from './MultipleAccountsSelector';
import { MonthUtil, newGetter } from '../utils';
import * as R from 'ramda';
import * as RU from '../ramda-utils';
import InputWrapper, { propLens as InputWrapperLens } from './InputWrapper';

export const MONTHS_PICKER_LABEL = "Initial and final months";
export const MULTIPLE_ACCOUNTS_LABEL = "Accounts";

export const propsLens = {

  value: R.lensPath(['value']),
  onChange: R.lensPath(['onChange']),
  accounts: R.lensPath(['accounts']),
  getCurrency: R.lensPath(['getCurrency']),
  getAccountBalanceEvolutionData: R.lensPath(['getAccountBalanceEvolutionData']),
  
};

export const valueLens = {

  pickedMonths: R.lensPath(['pickedMonths']),
  pickedAccounts: R.lensPath(['pickedAccounts']),
  data: R.lensPath(['data']),

};

/**
 * Calls onChange with a reducer for when the user picks a new month.
 */
export const handlePickedMonth = R.curry((onChange, i, newValue) => onChange(R.set(
  R.compose(valueLens.pickedMonths, R.lensPath([i])),
  newValue,  
)));

/**
 * Calls onChange with a reducer for when the user picks an account.
 */
export const handlePickedAccountsChange = R.curry((onChange, x) => onChange(R.set(
  valueLens.pickedAccounts,
  x
)));

/**
 * Calls onChange with a reducer for when new data is received.
 */
export const setAccountBalanceEvolutionData = R.curry((onChange, x) => onChange(R.set(
  valueLens.data,
  x
)));

/**
 * Handles submission of a request for getting the data for the account
 * balance evolution.
 * Returns a promise with the reduced value.
 */
export const handleSubmit = R.curry(props => {
  const value = R.view(propsLens.value, props);
  const pickedMonths = R.view(valueLens.pickedMonths, value);
  const pickedAccounts = R.view(valueLens.pickedAccounts, value);
  const onChange = R.view(propsLens.onChange, props);
  const getAccountBalanceEvolutionData = R.view(
    propsLens.getAccountBalanceEvolutionData,
    props
  );

  const errorMsg = R.find(
    R.complement(R.isNil),
    [validateMonths(pickedMonths), validateAccounts(pickedAccounts)]
  );
  if (errorMsg) {
    alert(errorMsg);
    return Promise.resolve(errorMsg);
  };

  return getAccountBalanceEvolutionData(pickedAccounts, pickedMonths)
    .then(setAccountBalanceEvolutionData(onChange))
    .catch(() => alert('Request failed!'));
  
});

export const AccountBalanceEvolutionComponent = props => {
  const onChange = R.view(propsLens.onChange, props);
  const pickedMonths = R.view(valueLens.pickedMonths, props.value);
  const data = R.view(valueLens.data, props.value);
  const pickedAccounts = R.view(valueLens.pickedAccounts, props.value);
  const accounts = R.view(propsLens.accounts, props);
  const getCurrency = R.view(propsLens.getCurrency, props);
  const getAccount = newGetter(R.prop("pk"), accounts);
  const monthPickers = makeMonthPickers(pickedMonths, handlePickedMonth(onChange));
  const accountBalanceEvolutionTable = makeAccountBalanceEvolutionTable(
    data, getCurrency, getAccount
  );
  return (
    <div className="form-div">
      {monthPickers}
      <AccountBalanceEvolutionMultipleAccountSelector {...props} />
      <button onClick={() => handleSubmit(props)}>Submit!</button>
      <div>
        {accountBalanceEvolutionTable}
      </div>
    </div>
  );
};
export default AccountBalanceEvolutionComponent;

/**
 * Component for wrapping MultipleAccountsSelector.
 */
export function AccountBalanceEvolutionMultipleAccountSelector(props) {
  const onChange = R.view(propsLens.onChange, props);
  const accounts = R.view(propsLens.accounts, props);
  const pickedAccounts = R.view(valueLens.pickedAccounts, props.value);
  const multipleAccountSelector = (
    <MultipleAccountsSelector
      accounts={accounts}
      selectedAccounts={pickedAccounts}
      onSelectedAccountsChange={handlePickedAccountsChange(onChange)} />
  );
  const inputWrapperProps = RU.objFromPairs(
    InputWrapperLens.label, MULTIPLE_ACCOUNTS_LABEL,
    InputWrapperLens.content, multipleAccountSelector,
  );
  return <InputWrapper {...inputWrapperProps} />;
};

/**
 * Returns two MonthPickers for the component
 */
export function makeMonthPickers(values, onPicked) {
  const monthPickers = R.addIndex(R.map)(
    (value, i) => createElement(MonthPicker, { key: i, value, onPicked: onPicked(i) }),
    values
  );
  const inputWrapperProps = RU.objFromPairs(
    InputWrapperLens.label, MONTHS_PICKER_LABEL,
    InputWrapperLens.content, monthPickers,
  );
  return <InputWrapper {...inputWrapperProps} />;
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
