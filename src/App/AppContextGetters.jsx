import * as R from 'ramda';
import * as RU from '../ramda-utils';
import { lens as AppContextLens } from './AppContext';
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
  AppContextLens.accounts, memoizedPkGetter(AppContextLens.accounts, appState),
  AppContextLens.currencies, memoizedPkGetter(AppContextLens.currencies, appState),
);
