import React from 'react';
import { lens as AppContextLens } from '../AppContext';
import { lens as AjaxInjectionsLens } from '../Ajax';
import * as R from 'ramda';
import CreateTransactionComponent from '../../components/CreateTransactionComponent';

export default function CreateTransactionComponentInstance({appContext, ajaxInjections}) {
  const createTransaction = R.view(AjaxInjectionsLens.createTransaction, ajaxInjections);
  const getTransaction = R.view(AjaxInjectionsLens.getTransaction, ajaxInjections);
  const accounts = R.view(AppContextLens.accounts, appContext);
  const currencies = R.view(AppContextLens.currencies, appContext);
  if (R.isNil(accounts) || R.isNil(currencies)) {
    return <p>Loading...</p>;
  }
  return (
    <CreateTransactionComponent
      createTransaction={createTransaction}
      getTransaction={getTransaction}
      accounts={accounts}
      currencies={currencies} />
  );
};
