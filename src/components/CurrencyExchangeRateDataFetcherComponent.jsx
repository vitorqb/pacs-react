import React from 'react';
import * as R from 'ramda';
import DateInput from './DateInput';
import CurrencyCodesPicker from './CurrencyCodesPicker';
import ErrorMessage from './ErrorMessage';
import * as utils from '../utils';
import { DateUtil, FileUtil } from '../utils';
import LoadingWrapper from './LoaddingWrapper';

/**
 * Lenses for the `.value` and `onChange` props
 */
export const valueLens = {
  startAt: R.lensPath(['startAt']),
  endAt: R.lensPath(['endAt']),
  _currencyCodesRawValue: R.lensPath(['_currencyCodesRawValue']),
  currencyCodes: R.lensPath(['currencyCodes']),
  _errorMessage: R.lensPath(['_errorMessage']),
  isLoading: R.lensPath(['isLoading']),
};


/**
 * A component that allows the user to fetch data for currency exchange rates.
 * - props.value.startAt:       MomentJs date for start date.
 * - props.value.endAt:         MomentJs date for end date.
 * - props.value.currencyCodes: ValidationWrapper with list of strings with currency codes.
 */
export function CurrencyExchangeRateDataFetcherComponent(
  { value, onChange, fetchCurrencyExchangeRateData }
) {
  return (
    <div className="currency-exchange-rate-data-fetcher">
      <LoadingWrapper isLoading={R.view(valueLens.isLoading, value)}>
        <_DatePicker
          value={R.view(valueLens.startAt, value)}
          onChange={x => onChange(R.set(valueLens.startAt, x, value))}
          label={"Start at"} />
        <_DatePicker
          value={R.view(valueLens.endAt, value)}
          onChange={x => onChange(R.set(valueLens.endAt, x, value))}
          label={"End at"} />
        <_CurrencyCodesPicker
          value={R.view(valueLens._currencyCodesRawValue, value)}
          onChange={x => _handleCurrencyCodeNewValue(value, onChange, x)}
          label={"Currency codes"} />
        <_SubmitBtn
          value={value}
          setValue={onChange}
          fetchCurrencyExchangeRateData={fetchCurrencyExchangeRateData} />
        <ErrorMessage value={R.view(valueLens._errorMessage, value)} />
      </LoadingWrapper>
    </div>
  );
}

/**
 * Handles a change of CurrencyCodePicker raw value.
 * @param value - The current value for the CurrencyExchangeRateDataFetcherComponent component.
 * @param onChange - Callback to set the value.
 * @param x - The new value from CurrencyCodePicker.
 */
export function _handleCurrencyCodeNewValue(value, onChange, x) {
  return onChange(R.pipe(
    R.set(valueLens._currencyCodesRawValue, x),
    R.set(valueLens.currencyCodes, x.value)
  )(value));
}

/**
 * A custom date picker.
 */
export function _DatePicker({ label, value, onChange }) {
  return (
    <_InputWrapper>
      <span>{label}</span>
      <DateInput
        value={value}
        onChange={onChange}
      />
    </_InputWrapper>
  );
}

/**
 * A currency codes picker.
 */
export function _CurrencyCodesPicker({ label, value, onChange }) {
  return (
    <_InputWrapper>
      <span>{"List of currencies"}<i>{"(e.g. EUR,BRL)"}</i></span>
      <CurrencyCodesPicker value={value} setValue={onChange} />
    </_InputWrapper>
  );
}

/**
 * A custom input wrapper
 */
export function _InputWrapper({ children }) {
  return (
    <div className="input-wrapper">
      <div className="input-wrapper__label">
        {children[0]}
      </div>
      <div className="input-wrapper__content">
        {children[1]}
      </div>
    </div>
  );
}

/**
 * A custom submit button
 */
export function _SubmitBtn({ value, setValue, fetchCurrencyExchangeRateData }) {
  return (
    <button onClick={e => _submitHandler.handleSubmit(value, setValue,
                                                      fetchCurrencyExchangeRateData, e)}>
      {"Fetch!"}
    </button>
  );
};

export const _submitHandler = {

  /**
   * Custom handle for submit button.
   * @param value - The value for CurrencyExchangeRateDataFetcherComponent.
   * @param setValue - Callback to set CurrencyExchangeRateDataFetcherComponent value.
   * @param fetchCurrencyExchangeRateData - The fn called to actually fetch the data.
   * @param e - The js event.
   */
  handleSubmit(value, setValue, fetchCurrencyExchangeRateData, e) {
    utils.withEventPrevention(e);
    if (this._isValidStateForSubmission(value)) {
      return this._handleValidSubmit(value, setValue, fetchCurrencyExchangeRateData);
    } else {
      return this._handleInvalidSubmit(value, setValue);
    }
  },

  /**
   * Returns a boolean indicating whether the value for CurrencyExchangeRateDataFetcherComponent
   * is valid for submission.
   * @param value - The value for CurrencyExchangeRateDataFetcherComponent.
   */
  _isValidStateForSubmission(value) { return R.isNil(this._getErrorMessage(value)); },

  /**
   * Returns an error message given the value for CurrencyExchangeRateDataFetcher, or null
   * if the value is valid.
   * @param value - The value for CurrencyExchangeRateDataFetcher.
   */
  _getErrorMessage(value) {
    const startAt = R.view(valueLens.startAt, value);
    if (R.isNil(startAt)) { return this._errMsgs.invalidStartAt; }

    const endAt = R.view(valueLens.endAt, value);
    if (R.isNil(endAt)) { return this._errMsgs.invalidEndAt; }

    const currencyCodes = R.view(valueLens.currencyCodes, value);
    if (R.equals(currencyCodes, []) || R.isNil(currencyCodes)) {
      return this._errMsgs.invalidCurrencyCodes;
    }

    return null;
  },

  /**
   * Custom handler for valid submits.
   * @param value - The value for CurrencyExchangeRateDataFetcherComponent.
   * @param setValue - Callback to set CurrencyExchangeRateDataFetcherComponent value.
   * @param fetchCurrencyExchangeRateData - The fn called to actually fetch the data.
   */
  _handleValidSubmit(value, setValue, fetchCurrencyExchangeRateData) {
    this._reduceValueBeforeSubmit(setValue, value);
    return this
      ._submit(value, fetchCurrencyExchangeRateData)
      .then(x => this._validRequestHandler(value, setValue, x))
      .catch(e => this._failedRequestHandler(value, setValue, e));
  },

  /**
   * Custom handler for valid submits.
   * @param value - The value for CurrencyExchangeRateDataFetcherComponent.
   * @param setValue - Callback to set CurrencyExchangeRateDataFetcherComponent value.
   */
  _handleInvalidSubmit(value, setValue) {
    const errMsg = this._getErrorMessage(value);
    return setValue(R.set(valueLens._errorMessage, errMsg, value));
  },

  /**
   * Extracts params and submits.
   * @param value - The value for CurrencyExchangeRateDataFetcherComponent.
   * @param fetchCurrencyExchangeRateData - The fn called to actually fetch the data.
   */
  _submit(value, fetchCurrencyExchangeRateData) {
    const startAt = R.view(valueLens.startAt, value);
    const endAt = R.view(valueLens.endAt, value);
    const currencyCodes = R.view(valueLens.currencyCodes, value);
    return fetchCurrencyExchangeRateData({ startAt, endAt, currencyCodes });
  },

  /**
   * Reduces the state before a valid submit.
   * @param value - The value for CurrencyExchangeRateDataFetcherComponent.
   * @param setValue - Callback to set CurrencyExchangeRateDataFetcherComponent value.
   */
  _reduceValueBeforeSubmit(setValue, value) {
    return setValue(R.pipe(
      R.set(valueLens.isLoading, true),
      R.set(valueLens._errorMessage, null)
    )(value));
  },

  /**
   * Request callback after a valid submit.
   * @param value - The value for CurrencyExchangeRateDataFetcherComponent.
   * @param setValue - Callback to set CurrencyExchangeRateDataFetcherComponent value.
   * @param response - The response data.
   */
  _validRequestHandler(value, setValue, response) {
    setValue(R.set(valueLens.isLoading, false, value));
    FileUtil.downloadFromString(JSON.stringify(response));
  },

  /**
   * Request callback after a failed submit.
   * @param value - The value for CurrencyExchangeRateDataFetcherComponent.
   * @param setValue - Callback to set CurrencyExchangeRateDataFetcherComponent value.
   * @param error - The error data.
   */
  _failedRequestHandler(value, setValue, error) {
    return setValue(R.pipe(
      R.set(valueLens.isLoading, false),
      R.set(valueLens._errorMessage, error),
    )(value));
  },

  /**
   * Error messages.
   */
  _errMsgs: {
    invalidStartAt: "Start date is invalid!",
    invalidEndAt: "End date is invalid!",
    invalidCurrencyCodes: "Currency codes is invalid!",
  },
};

export default CurrencyExchangeRateDataFetcherComponent;
