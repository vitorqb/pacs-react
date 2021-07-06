import React from 'react';
import { lens as AppContextLens } from '../AppContext';
import { lens as AjaxInjectionsLens } from '../Ajax';
import * as R from 'ramda';
import CreateAccountComponent from '../../components/CreateAccountComponent';

export default function CreateAccountComponentInstance({ appContext, ajaxInjections}) {
  const accounts = R.view(AppContextLens.accounts, appContext);
  const createAcc = R.view(AjaxInjectionsLens.createAcc, ajaxInjections);
  if (R.isNil(accounts)) {
    return <p>Loading...</p>;
  }
  return <CreateAccountComponent createAcc={createAcc} accounts={accounts} />;
};
