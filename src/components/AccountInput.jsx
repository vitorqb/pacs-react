// A component responsible for selecting an account
import React from 'react';
import Select from 'react-select';

// !!!! TODO -> Make onChange being called with Account.
export default function AccountInput({ accounts, selectedAcc, onChange }) {
  const options = accounts.map(acc => ({value: acc, label: acc.name}));
  return (
    <Select options={options} onChange={onChange} value={selectedAcc} />
  )
}
