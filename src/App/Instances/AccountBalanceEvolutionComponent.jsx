import React, { createElement } from 'react';
import { lens as AppLens } from '../Lens';
import { lens as AjaxInjectionsLens } from '../Ajax';
import * as R from 'ramda';
import AccountBalanceEvolutionComponent from '../../components/AccountBalanceEvolutionComponent';


export default function AccountBalanceEvolutionComponentInstance(
  { state, stateGetters, ajaxInjections }
){
  const accounts = R.view(AppLens.accounts, state);
  const currencies = R.view(AppLens.currencies, state);
  const getAccountBalanceEvolutionData = R.view(
    AjaxInjectionsLens.getAccountBalanceEvolutionData,
    ajaxInjections
  );
  if (R.isNil(accounts) || R.isNil(currencies)) {
    return <p>Loading...</p>;
  }
  return createElement(
    AccountBalanceEvolutionComponent,
    {
      accounts,
      getCurrency: R.view(AppLens.currencies, stateGetters),
      getAccountBalanceEvolutionData,
    }
  );
}
