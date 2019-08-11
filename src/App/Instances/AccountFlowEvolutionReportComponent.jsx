import React, { createElement } from 'react';
import { lens as AppLens } from '../Lens';
import { lens as AjaxInjectionsLens } from '../Ajax';
import * as R from 'ramda';
import AccountFlowEvolutionReportComponent from '../../components/AccountFlowEvolutionReportComponent';

export default function AccountFlowEvolutionReportComponentInstance(
  { state, stateGetters, ajaxInjections}
){
  const accounts = R.view(AppLens.accounts, state);
  const currencies = R.view(AppLens.currencies, state);
  const getAccountsFlowsEvolutionData = R.view(
    AjaxInjectionsLens.getAccountsFlowsEvolutionData,
    ajaxInjections,
  );
  if (R.isNil(accounts) || R.isNil(currencies)) {
    return <p>Loading...</p>;
  }
  return createElement(
    AccountFlowEvolutionReportComponent,
    {
      getAccountsFlowsEvolutionData,
      accounts,
      currencies,
      getCurrency: R.view(AppLens.currencies, stateGetters),
      getAccount: R.view(AppLens.accounts, stateGetters),
    }
  );
}
