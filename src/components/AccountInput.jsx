// A component responsible for selecting an account
import React from 'react';
import Select from 'react-select';
import * as R from 'ramda';


/**
 * @param {Object} props
 * @param {Account[]} props.accounts
 * @param {Account} props.value
 * @param {fn(Account):?} props.onChange
 */
export default function AccountInput({ accounts, value, onChange }) {
  const accountToOption = acc => ({value: acc, label: acc.name});
  const options = R.map(accountToOption, accounts);
  const selectedOption = value ? accountToOption(value) : null;
  const handleChange = R.pipe(R.prop("value"), onChange);
  return (
    <Select
      options={options}
      onChange={handleChange}
      value={selectedOption} />
  )
}
