import React, { createElement } from 'react';
import AccountInput from './AccountInput';
import * as R from 'ramda';
import { omitIndexes } from '../utils';

/**
 * Allows the user to select multiple accounts using AccountInput
 */
export default function MultipleAccountsSelector(props={}) {
  const inject = props.inject || {};
  const _AccountInput = inject.AccountInput || AccountInput;

  const selectedAccounts = props.selectedAccounts;
  const onSelectedAccountsChange = props.onSelectedAccountsChange;
  const accounts = props.accounts;

  function handleDelete(i) {
    // Calls onSelectedAccountsChange with the ith entry deleted.
    onSelectedAccountsChange(omitIndexes([i], selectedAccounts));
  }

  function handleAddition() {
    // Adds calls onChange with null appended to selectedAccounts
    onSelectedAccountsChange(R.append(null, selectedAccounts));
  }

  const handleAccountInputChange = R.curry((i, newValue) => {
    // Passes the selected account up
    onSelectedAccountsChange(R.update(i, newValue, selectedAccounts));
  });

  const accountInputs = R.addIndex(R.map)(
    (acc, i) => (
      <WithDeleteButton key={i} onDelete={() => handleDelete(i)}>
        <_AccountInput
          data-acc-input
          accounts={accounts}
          value={acc}
          onChange={handleAccountInputChange(i)} />
      </WithDeleteButton>
    ),
    selectedAccounts
  );

  return (
    <div>
      {accountInputs}
      <AddButton onAdd={handleAddition} />
    </div>
  );
}

export function AddButton(props) {
  return <button data-add-but onClick={(_) => props.onAdd()}>Add</button>;
}

export function WithDeleteButton(props) {
  const children = props.children;
  const onDelete = props.onDelete;
  return (
    <div>
      {children}
      <button data-delete-but onClick={_ => onDelete()}>Delete</button>
    </div>
  );
}
