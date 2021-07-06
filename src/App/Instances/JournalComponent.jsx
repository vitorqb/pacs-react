import React from 'react';
import { lens as AppContextLens } from '../AppContext';
import { lens as AjaxInjectionsLens } from '../Ajax';
import * as R from 'ramda';
import JournalComponent from '../../components/JournalComponent.jsx';
import { defaultColumnMakers } from '../../components/JournalTable.jsx';
import { isDescendant } from '../../utils';

export default function JournalComponentInstance(
  { appContext, appContextGetters, ajaxInjections }
) {
  const currencies = R.view(AppContextLens.currencies, appContext);
  const accounts = R.view(AppContextLens.accounts, appContext);
  const getPaginatedJournalDataForAccount = R.view(
    AjaxInjectionsLens.getPaginatedJournalDataForAccount,
    ajaxInjections,
  );
  if (R.isNil(accounts) || R.isNil(currencies)) {
    return <p>Loading...</p>;
  }
  return (
    <JournalComponent
      accounts={accounts}
      isDescendant={isDescendant(accounts)}
      getCurrency={R.view(AppContextLens.currencies, appContextGetters)}
      columnMakers={defaultColumnMakers}
      getPaginatedJournalDataForAccount={getPaginatedJournalDataForAccount} />
  );  
};
