import React from 'react';
import { lens as AppLens } from '../Lens';
import { lens as AjaxInjectionsLens } from '../Ajax';
import * as R from 'ramda';
import EditTransactionComponent from '../../components/EditTransactionComponent';

export default function renderEditTransactionComponent({state, ajaxInjections}) {
  const getTransaction = R.view(AjaxInjectionsLens.getTransaction, ajaxInjections);
  const updateTransaction = R.view(AjaxInjectionsLens.updateTransaction, ajaxInjections);
  const accounts = R.view(AppLens.accounts, state);
  const currencies = R.view(AppLens.currencies, state);
  if (R.isNil(accounts) || R.isNil(currencies)) {
    return <p>Loading...</p>;
  }
  return (
    <EditTransactionComponent
      getTransaction={getTransaction}
      updateTransaction={updateTransaction}
      accounts={accounts}
      currencies={currencies} />
  );
}
