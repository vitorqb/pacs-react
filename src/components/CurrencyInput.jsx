import React from 'react';
import Select from 'react-select';
import * as R from 'ramda';

/**
 * A wrapper around Select to select a currency
 * @param {object} props
 * @param {Currency[]} currencies
 * @param {Currency} value
 * @param {fn(Currency): ?} onChange
 */
export default function CurrencyInput({ currencies, value, onChange }) {
  const options = currencies.map(cur => ({value: cur, label: cur.name}));
  const selectedOption = value ? {value, label: value.name} : null;
  const extractCurrencyFromOnChangeEvent = R.prop("value");
  const onChangeHandler = R.pipe(extractCurrencyFromOnChangeEvent, onChange);
  return (
    <Select
      options={options}
      onChange={onChangeHandler}
      value={selectedOption} />
  );
}
