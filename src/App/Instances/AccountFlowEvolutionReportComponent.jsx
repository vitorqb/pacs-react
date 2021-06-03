import React, { createElement } from 'react';
import { lens as AppLens } from '../Lens';
import { lens as AjaxInjectionsLens } from '../Ajax';
import * as R from 'ramda';
import AccountFlowEvolutionReportComponent from '../../components/AccountFlowEvolutionReportComponent';

export default function AccountFlowEvolutionReportComponentInstance(
  { appContext, appContextGetters, ajaxInjections}
){
  const accounts = R.view(AppLens.accounts, appContext);
  const currencies = R.view(AppLens.currencies, appContext);
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
      getCurrency: R.view(AppLens.currencies, appContextGetters),
      getAccount: R.view(AppLens.accounts, appContextGetters),
    }
  );
}
