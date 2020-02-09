import React from 'react';
import * as R from 'ramda';
import * as RU from '../ramda-utils';

export const valueLens = {
  _inputValue: R.lensPath(['_inputValue']),
  value: R.lensPath(['value'])
};

/**
 * A component to pick a list of currency codes.
 * @param props.value - Current value.
 * @param props.setValue - Callback to set value.
 */
export function CurrencyCodesPicker({ value, setValue }) {
  const inputValue = R.view(valueLens._inputValue, value) || "";
  return (
    <input value={inputValue} onChange={e => _handleChange(setValue, e)}></input>
  );
}

/**
 * Handles changes for the underlying input.
 * @param setValue - Callback for setting the value.
 * @param event - The raw input change js event.
 */
export function _handleChange(setValue, event) {
  event.preventDefault();
  const newRawInput = event.target.value;
  return setValue(RU.objFromPairs(
    valueLens._inputValue, newRawInput,
    valueLens.value, _inputValueToValue(newRawInput)
  ));
}

/**
 * Converts between the raw input value and the value.
 */
export function _inputValueToValue(inputValue) {
  if (R.isNil(inputValue) || inputValue === "") {
    return [];
  } else {
    return inputValue.replace(/ /g, "").split(",");
  }
}

export default CurrencyCodesPicker;
