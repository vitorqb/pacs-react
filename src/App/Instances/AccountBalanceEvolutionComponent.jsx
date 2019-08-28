import React, { createElement } from 'react';
import { lens as AppLens } from '../Lens';
import { lens as AjaxInjectionsLens } from '../Ajax';
import * as R from 'ramda';
import * as RU from '../../ramda-utils';
import { lens as EventsLens } from '../Events';
import AccountBalanceEvolutionComponent, { propsLens, valueLens } from '../../components/AccountBalanceEvolutionComponent';

export const initialState = RU.objFromPairs(
  valueLens.pickedAccounts, [null, null],
  valueLens.pickedMonths, [null, null],
);

export default function AccountBalanceEvolutionComponentInstance(renderArgs){
  const { state, events, stateGetters, ajaxInjections } = renderArgs;
  const accounts = R.view(AppLens.accounts, state);
  const currencies = R.view(AppLens.currencies, state);

  if (R.isNil(accounts) || R.isNil(currencies)) {
    return <p>Loading...</p>;
  }

  const getAccountBalanceEvolutionData = R.view(
    AjaxInjectionsLens.getAccountBalanceEvolutionData,
    ajaxInjections
  );
  const overState = R.view(EventsLens.overState, events);
  const instanceLens = AppLens.accountBalanceEvolutionInstanceValue;
  const props = RU.objFromPairs(
    propsLens.onChange, overState(instanceLens),
    propsLens.accounts, accounts,
    propsLens.getCurrency, R.view(AppLens.currencies, stateGetters),
    propsLens.getAccountBalanceEvolutionData, getAccountBalanceEvolutionData,
    R.lensPath(['value']), R.view(instanceLens, state),
  );
  return createElement(AccountBalanceEvolutionComponent, props);
}
