import React from 'react';
import { lens as AppLens } from '../Lens';
import { lens as AjaxInjectionsLens } from '../Ajax';
import * as R from 'ramda';
import EditAccountComponent from '../../components/EditAccountComponent.jsx';
import { lens as EventsLens } from '../Events';

export default function EditAccountComponentInstance({appContext, ajaxInjections, events}) {
  const accounts = R.view(AppLens.accounts, appContext);
  const updateAcc = R.view(AjaxInjectionsLens.updateAcc, ajaxInjections);
  const refetchAppContext = R.view(EventsLens.refetchAppContext, events);
  if (R.isNil(accounts)) {
    return <p>Loading...</p>;
  }
  return <EditAccountComponent
           editAccount={updateAcc}
           accounts={accounts}
           refetchAppContext={refetchAppContext} />;
};
