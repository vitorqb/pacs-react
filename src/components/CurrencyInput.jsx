import React from 'react';
import Select from 'react-select';
import * as R from 'ramda';

export default function CurrencyInput({ currencies, selectedCur, onChange }) {
  const options = currencies.map(cur => ({value: cur, label: cur.name}));
  const extractCurrencyFromOnChangeEvent = R.prop("value");
  const onChangeHandler = R.pipe(extractCurrencyFromOnChangeEvent, onChange);
  return (
    <Select options={options} onChange={onChangeHandler} value={selectedCur} />
  )
}
