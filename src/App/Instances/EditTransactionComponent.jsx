import React from 'react';
import { lens as AppContextLens } from '../AppContext';
import { lens as AjaxInjectionsLens } from '../Ajax';
import * as R from 'ramda';
import EditTransactionComponent from '../../components/EditTransactionComponent';

export default function renderEditTransactionComponent({appContext, ajaxInjections}) {
  const getTransaction = R.view(AjaxInjectionsLens.getTransaction, ajaxInjections);
  const updateTransaction = R.view(AjaxInjectionsLens.updateTransaction, ajaxInjections);
  const accounts = R.view(AppContextLens.accounts, appContext);
  const currencies = R.view(AppContextLens.currencies, appContext);
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
