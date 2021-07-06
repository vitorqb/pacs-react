import React, { createElement } from 'react';
import { lens as AppContextLens } from '../AppContext';
import { lens as AjaxInjectionsLens } from '../Ajax';
import * as R from 'ramda';
import AccountFlowEvolutionReportComponent from '../../components/AccountFlowEvolutionReportComponent';

export default function AccountFlowEvolutionReportComponentInstance(
  { appContext, appContextGetters, ajaxInjections}
){
  const accounts = R.view(AppContextLens.accounts, appContext);
  const currencies = R.view(AppContextLens.currencies, appContext);
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
      getCurrency: R.view(AppContextLens.currencies, appContextGetters),
      getAccount: R.view(AppContextLens.accounts, appContextGetters),
    }
  );
}
