import React, { createElement, useState } from 'react';
import { lens as AppContextLens } from '../AppContext';
import { lens as AjaxInjectionsLens } from '../Ajax';
import * as R from 'ramda';
import * as RU from '../../ramda-utils';
import AccountBalanceEvolutionComponent, { propsLens, valueLens } from '../../components/AccountBalanceEvolutionComponent';

export const initialState = RU.objFromPairs(
  valueLens.pickedAccounts, [null, null],
  valueLens.pickedMonths, [null, null],
);

export function AccountBalanceEvolutionComponentInstance(renderArgs){
  const [instanceState, setInstanceState] = useState(initialState);
  const { appContext, appContextGetters, ajaxInjections } = renderArgs;
  const accounts = R.view(AppContextLens.accounts, appContext);
  const currencies = R.view(AppContextLens.currencies, appContext);

  if (R.isNil(accounts) || R.isNil(currencies)) {
    return <p>Loading...</p>;
  }

  const getAccountBalanceEvolutionData = R.view(
    AjaxInjectionsLens.getAccountBalanceEvolutionData,
    ajaxInjections
  );
  const props = RU.objFromPairs(
    propsLens.onChange, setInstanceState,
    propsLens.accounts, accounts,
    propsLens.currencies, currencies,
    propsLens.getCurrency, R.view(AppContextLens.currencies, appContextGetters),
    propsLens.getAccount, R.view(AppContextLens.accounts, appContextGetters),
    propsLens.getAccountBalanceEvolutionData, getAccountBalanceEvolutionData,
    R.lensPath(['value']), instanceState,
  );
  return createElement(AccountBalanceEvolutionComponent, props);
}

export default AccountBalanceEvolutionComponentInstance;
