import React, { createElement } from 'react';
import MonthPicker from './MonthPicker';
import MultipleAccountsSelector from './MultipleAccountsSelector';
import { MonthUtil } from '../utils';
import * as R from 'ramda';
import * as RU from '../ramda-utils';
import InputWrapper, { propLens as InputWrapperLens } from './InputWrapper';
import * as AccountBalance from '../domain/AccountBalance/core';
import * as SimpleTable from './SimpleTable';
import SimpleTableComponent from './SimpleTable';
import PortifolioFilePicker, { valueLens as PortifolioFilePickerValueLens } from './PortifolioFilePicker';
import CurrencyInput from './CurrencyInput';
import { Success, Fail } from 'monet';

export const TARGET_CURRENCY_LABEL = "Target Currency";
export const MONTHS_PICKER_LABEL = "Initial and final months";
export const MULTIPLE_ACCOUNTS_LABEL = "Accounts";
export const PORTIFOLIO_FILE_PICKER_LABEL = "Currency Price Portifolio File";;

export const propsLens = {

  value: R.lensPath(['value']),
  onChange: R.lensPath(['onChange']),
  accounts: R.lensPath(['accounts']),
  currencies: R.lensPath(['currencies']),
  getCurrency: R.lensPath(['getCurrency']),
  getAccount: R.lensPath(['getAccount']),
  getAccountBalanceEvolutionData: R.lensPath(['getAccountBalanceEvolutionData']),
  
};

export const portifolioPickerValueLens = R.lensPath(['portifolioPickerValueLens']);
export const valueLens = {

  pickedMonths: R.lensPath(['pickedMonths']),
  pickedAccounts: R.lensPath(['pickedAccounts']),
  portifolioPickerValue: portifolioPickerValueLens,
  pickedPortifolio: R.compose(portifolioPickerValueLens, PortifolioFilePickerValueLens.portifolio),
  pickedTargetCurrency: R.lensPath(['pickedTargetCurrency']),
  data: R.lensPath(['data']),

};

/**
 * View the table data from props.
 */
export const viewTableData = props => {
  const getAccount = R.view(propsLens.getAccount, props);
  const getCurrency = R.view(propsLens.getCurrency, props);
  return R.pipe(
    R.view(R.compose(propsLens.value, valueLens.data, R.lensPath(['data']))),
    R.ifElse(
      R.isNil,
      R.always([]),
      R.map(data => AccountBalance.toCellData({getAccount, getCurrency, data})),
    ),
  )(props);
};

/**
 * View the table x labels (headers).
 */
export const viewXLabels = R.pipe(
  R.view(R.compose(propsLens.value, valueLens.data, R.lensPath(['data']))),
  R.ifElse(
    R.isNil,
    R.always([]),
    R.pipe(R.map(R.prop('date')), R.uniq, R.sort(R.comparator(R.lt)),)
  )
);

/**
 * View the table y labels (rows).
 */
export const viewYLabels = props => {
  const getAccount = R.view(propsLens.getAccount, props);
  return R.pipe(
    R.view(R.compose(propsLens.value, valueLens.data, R.lensPath(['data']))),
    R.ifElse(
      R.isNil,
      R.always([]),
      R.pipe(
        R.map(R.pipe(R.prop('account'), getAccount,  R.prop('name'))),
        R.uniq,
      ),
    ),
  )(props);
};

/**
 * A generic handler factory with one lens and a new value.
 */
export const handleChange = R.curry((l, onChange, x) => onChange(R.set(l, x)));
export const handleChangeWithReducer = R.curry((l, onChange, f) => onChange(R.over(l, f)));

/**
 * Handlers.
 */
export const handlePickedPortifolio = handleChangeWithReducer(valueLens.portifolioPickerValue);

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
export const handlePickedAccountsChange = handleChange(valueLens.pickedAccounts);

/**
 * Calls onChange with a reducer for when new data is received.
 */
export const setAccountBalanceEvolutionData = handleChange(valueLens.data);

/**
 * Calls onChange with a reducer for when a new currency is picked.
 */
export const handlePickedTargetCurrencyChange = handleChange(valueLens.pickedTargetCurrency);

/**
 * Handles submission of a request for getting the data for the account
 * balance evolution.
 * Returns a promise with the reduced value.
 */
export const handleSubmit = R.curry(props => {
  const onChange = R.view(propsLens.onChange, props);
  const getAccountBalanceEvolutionData = R.view(
    propsLens.getAccountBalanceEvolutionData,
    props
  );

  const validatedParams = validatedParamsForAccountBalanceEvolutionDataRequest(props);
  if (validatedParams.isFail()) {
    alert(validatedParams.fail());
    return Promise.resolve(validatedParams.fail());
  }

  return getAccountBalanceEvolutionData(validatedParams.success())
    .then(setAccountBalanceEvolutionData(onChange))
    .catch(e => alert(`Request failed: ${e}`));
  
});

export const AccountBalanceEvolutionComponent = props => {
  const onChange = R.view(propsLens.onChange, props);
  const pickedMonths = R.view(valueLens.pickedMonths, props.value);
  const monthPickers = makeMonthPickers(pickedMonths, handlePickedMonth(onChange));
  const simpleTableProps = RU.objFromPairs(
    SimpleTable.propsLens.data, viewTableData(props),
    SimpleTable.propsLens.xLabels, viewXLabels(props),
    SimpleTable.propsLens.yLabels, viewYLabels(props),
  );
  return (
    <div className="form-div">
      <AccountBalancePortifolioFilePicker {...props} />
      <AccountBalanceCurrencyInput {...props} />
      {monthPickers}
      <AccountBalanceEvolutionMultipleAccountSelector {...props} />
      <button onClick={() => handleSubmit(props)}>Submit!</button>
      <div>
        <SimpleTableComponent {...simpleTableProps} />
      </div>
    </div>
  );
};
export default AccountBalanceEvolutionComponent;

/**
 * Component for wrapping CurrencyInput.
 */
export function AccountBalanceCurrencyInput(props) {
  const onChange = R.view(propsLens.onChange, props);
  const pickedTargetCurrency = R.view(valueLens.pickedTargetCurrency, props.value);
  const currencies = R.view(propsLens.currencies, props);
  const currencyInput = (
    <CurrencyInput
      currencies={currencies}
      onChange={handlePickedTargetCurrencyChange(onChange)}
      value={pickedTargetCurrency} />
  );
  const inputWrapperProps = RU.objFromPairs(
    InputWrapperLens.label, TARGET_CURRENCY_LABEL,
    InputWrapperLens.content, currencyInput,
  );
  return <InputWrapper {...inputWrapperProps} />;
};

/**
 * Component for wrapping PortifolioFilePicker.
 */
export function AccountBalancePortifolioFilePicker(props) {
  const onChange = R.view(propsLens.onChange, props);
  const portifolioPickerValue = R.view(valueLens.portifolioPickerValue, props.value);
  const portifolioPicker = (
    <PortifolioFilePicker
      onChange={handlePickedPortifolio(onChange)}
      value={portifolioPickerValue} />
  );
  const inputWrapperProps = RU.objFromPairs(
    InputWrapperLens.label, PORTIFOLIO_FILE_PICKER_LABEL,
    InputWrapperLens.content, portifolioPicker,
  );
  return <InputWrapper {...inputWrapperProps} />;
};

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

/**
 * Extracts and validates the params for getAccountBalanceEvolutionData.
 * Returns a Validation.
 */
export function validatedParamsForAccountBalanceEvolutionDataRequest(props) {

  const value = R.view(propsLens.value,  props);
  const pickedMonths = R.view(valueLens.pickedMonths, value);
  const pickedMonthsErr = validateMonths(pickedMonths);
  const pickedAccounts = R.view(valueLens.pickedAccounts, value);
  const pickedAccountsErr = validateAccounts(pickedAccounts);
  const pickedPortifolio = R.view(valueLens.pickedPortifolio, value);
  const pickedTargetCurrency = R.view(valueLens.pickedTargetCurrency, value);
  const params = R.pipe(
    R.assoc('months', pickedMonths),
    R.assoc('accounts', pickedAccounts),
    R.when(
      _ => pickedPortifolio,
      R.assocPath(['currencyOpts', 'portifolio'], pickedPortifolio)
    ),
    R.when(
      _ => pickedTargetCurrency,
      R.assocPath(['currencyOpts', 'convertTo'], pickedTargetCurrency)
    )
  )({});
  if (! R.isNil(pickedMonthsErr)) { return Fail(pickedMonthsErr); };
  if (! R.isNil(pickedAccountsErr)) { return Fail(pickedAccountsErr); };
  return Success(params);
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
