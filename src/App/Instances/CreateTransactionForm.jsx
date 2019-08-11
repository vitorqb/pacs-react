import React from 'react';
import { lens as AppLens } from '../Lens';
import { lens as AjaxInjectionsLens } from '../Ajax';
import * as R from 'ramda';
import CreateTransactionComponent from '../../components/CreateTransactionComponent';

export default function CreateTransactionComponentInstance({state, ajaxInjections}) {
  const createTransaction = R.view(AjaxInjectionsLens.createTransaction, ajaxInjections);
  const accounts = R.view(AppLens.accounts, state);
  const currencies = R.view(AppLens.currencies, state);
  if (R.isNil(accounts) || R.isNil(currencies)) {
    return <p>Loading...</p>;
  }
  return (
    <CreateTransactionComponent
      createTransaction={createTransaction}
      accounts={accounts}
      currencies={currencies} />
  );
};
