import * as R from 'ramda';
import * as RU from '../ramda-utils';
import { lens as AppLens } from './Lens';
import { newGetter, memoizeSimple } from '../utils';

const memoizedPkGetter = (applens, appState) => {
  const stateValue = R.view(applens, appState);
  const getter = newGetter(R.prop('pk'), stateValue);
  return memoizeSimple(getter);  
};

/**
 * Returns memoized getters from 
 */
export const makeGetters = appState => RU.objFromPairs(
  AppLens.accounts, memoizedPkGetter(AppLens.accounts, appState),
  AppLens.currencies, memoizedPkGetter(AppLens.currencies, appState),
  AppLens.transactions, memoizedPkGetter(AppLens.transactions, appState),
);
