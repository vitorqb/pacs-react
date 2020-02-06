import React from 'react';
import * as R from 'ramda';
import DateInput from './DateInput';
import CurrencyCodesPicker from './CurrencyCodesPicker';

/**
 * Lenses for the `.value` and `onChange` props
 */
export const valueLens = {
  startAt: R.lensPath(['startAt']),
  endAt: R.lensPath(['endAt']),
  _currencyCodesRawValue: R.lensPath(['_currencyCodesRawValue']),
  currencyCodes: R.lensPath(['currencyCodes']),
};


/**
 * A component that allows the user to fetch data for currency exchange rates.
 * - props.value.startAt:       MomentJs date for start date.
 * - props.value.endAt:         MomentJs date for end date.
 * - props.value.currencyCodes: ValidationWrapper with list of strings with currency codes.
 */
export function CurrencyExchangeRateDataFetcherComponent({ value, onChange }) {
  return (
    <div>
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

export default CurrencyExchangeRateDataFetcherComponent;
