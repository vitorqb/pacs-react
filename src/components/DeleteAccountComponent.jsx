import React from 'react';
import * as R from 'ramda';
import AccountInput from './AccountInput';
import ErrorMessage from './ErrorMessage';
import SuccessMessage from './SuccessMessage';

export const ERRORS = {
  AccountNotSelected: "No account is selected!",
};

export const propsLens = {
  value: R.lensPath(['value']),
  onChange: R.lensPath(['onChange']),
  accounts: R.lensPath(['accounts']),
  onSubmitDelete: R.lensPath(['onSubmitDelete']),
};

export const valueLens = {
  selectedAccount: R.lensPath(['selectedAccount']),
  errorMsg: R.lensPath(['errorMsg']),
  successMsg: R.lensPath(['successMsg']),
};

/**
 * Handles the event of submitting the account for deletion.
 */
export const handleSubmit = R.curry((props, event) => {
  event.preventDefault();
  const value = R.view(propsLens.value, props);
  const account = R.view(valueLens.selectedAccount, value);
  const onChange = R.view(propsLens.onChange, props);

  if (R.isNil(account)) {
    onChange(R.set(valueLens.errorMsg, ERRORS.AccountNotSelected));
  } else {
    onChange(R.set(valueLens.errorMsg, ""));
    const onSubmitDelete = R.view(propsLens.onSubmitDelete, props);
    onSubmitDelete(account);
  }
});

/**
 * Handles the event of a change of value for AccountInput. Event is the
 * selected account.
 */
export const handleAccountInputChange = R.curry((props, event) => {
  const onChange = R.view(propsLens.onChange, props);
  onChange(R.set(valueLens.selectedAccount, event));
});

export default function DeleteAccountComponent(props) {
  const accounts = R.view(propsLens.accounts, props);
  const value = R.view(propsLens.value, props);
  const selectedAccount = R.view(valueLens.selectedAccount, value);
  return (
    <div className="delete-account-component">
      <form onSubmit={handleSubmit(props)}>
        <AccountInput
          accounts={accounts}
          value={selectedAccount}
          onChange={handleAccountInputChange(props)}
        />
        <input type="submit" value="Submit" />
      </form>
      <ErrorMessage value={R.view(valueLens.errorMsg, value)} />
      <SuccessMessage value={R.view(valueLens.successMsg, value)} />
    </div>
  );
};
