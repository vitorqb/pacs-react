import React from 'react';
import { lens as AppLens } from '../Lens';
import { lens as AjaxInjectionsLens } from '../Ajax';
import * as R from 'ramda';
import CreateTransactionComponent from '../../components/CreateTransactionComponent';

export default function CreateTransactionComponentInstance({appContext, ajaxInjections}) {
  const createTransaction = R.view(AjaxInjectionsLens.createTransaction, ajaxInjections);
  const getTransaction = R.view(AjaxInjectionsLens.getTransaction, ajaxInjections);
  const accounts = R.view(AppLens.accounts, appContext);
  const currencies = R.view(AppLens.currencies, appContext);
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
