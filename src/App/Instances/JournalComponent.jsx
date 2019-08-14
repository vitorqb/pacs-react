import React from 'react';
import { lens as AppLens } from '../Lens';
import { lens as AjaxInjectionsLens } from '../Ajax';
import * as R from 'ramda';
import JournalComponent from '../../components/JournalComponent.jsx';
import { defaultColumnMakers } from '../../components/JournalTable.jsx';
import { isDescendant } from '../../utils';

export default function JournalComponentInstance(
  { state, stateGetters, ajaxInjections }
) {
  const currencies = R.view(AppLens.currencies, state);
  const accounts = R.view(AppLens.accounts, state);
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
      getCurrency={R.view(AppLens.currencies, stateGetters)}
      columnMakers={defaultColumnMakers}
      getPaginatedJournalDataForAccount={getPaginatedJournalDataForAccount} />
  );  
};
