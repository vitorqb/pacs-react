import React from 'react';
import { lens as AppLens } from '../Lens';
import { lens as AjaxInjectionsLens } from '../Ajax';
import * as R from 'ramda';
import EditAccountComponent from '../../components/EditAccountComponent.jsx';

export default function EditAccountComponentInstance({state, ajaxInjections}) {
  const accounts = R.view(AppLens.accounts, state);
  const updateAcc = R.view(AjaxInjectionsLens.updateAcc, ajaxInjections);
  if (R.isNil(accounts)) {
    return <p>Loading...</p>;
  }
  return <EditAccountComponent editAccount={updateAcc} accounts={accounts} />;
};
