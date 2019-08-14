import * as Ajax from './Ajax';
import * as R from 'ramda';
import * as RU from '../ramda-utils';
import { lens as AppLens } from './Lens';

/**
 * Specifications for data fetching. Each element is a tuple of (ajaxFn, lenses),
 * where `ajaxFn` is the function accepting an `ajaxInjection` and returning a
 * promise with the data to be set on the state.
 */
export const fetcherSpecs = [
  [
    RU.viewAndCallWithoutArgs(Ajax.lens.getAccounts),
    AppLens.accounts,
  ],
  [
    RU.viewAndCallWithoutArgs(Ajax.lens.getTransactions),
    AppLens.transactions,
  ],
  [
    RU.viewAndCallWithoutArgs(Ajax.lens.getCurrencies),
    AppLens.currencies,
  ],
];

/**
 * Takes an AjaxInjections, runs all ajax requests as given by `specs`,
 * and returns a reducer function that takes a state and returns a new state.
 */
export const _fetch = R.curry((specs, ajaxInjections) => R.pipe(
  R.map(([ajaxFn, l]) => [ajaxFn(ajaxInjections), l]), // Execute ajaxFn with injections
  R.map(([prom, l]) => prom.then(R.set(l))),           // Promise Fn that set's l to x
  x => Promise.all(x),                                 // Joins into one promise
  R.then(R.apply(R.compose))                           // Composes all fns into one
)(specs));

export const fetch = _fetch(fetcherSpecs);
