import React, {useState, useEffect} from 'react';
import * as Ajax from './Ajax';
import * as R from 'ramda';
import * as RU from '../ramda-utils';
import { LoadingWrapper } from '../components/LoaddingWrapper.jsx';

export const lens = {
  accounts: R.lensPath(['accounts']),
  currencies: R.lensPath(['currencies']),
  featureFlagsSvc: R.lensPath(['featureFlagsSvc']),
  actionDispatcher: R.lensPath(['actionDispatcher']),
  navigationService: R.lensPath(['navigationService']),
  appContextService: R.lensPath(['appContextService']),
};

/**
 * Specifications for data fetching. Each element is a tuple of (ajaxFn, lenses),
 * where `ajaxFn` is the function accepting an `ajaxInjection` and returning a
 * promise with the data to be set on the state.
 */
export const fetcherSpecs = [
  [
    RU.viewAndCallWithoutArgs(Ajax.lens.getAccounts),
    lens.accounts,
  ],
  [
    RU.viewAndCallWithoutArgs(Ajax.lens.getCurrencies),
    lens.currencies,
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
  R.andThen(R.apply(R.compose))                           // Composes all fns into one
)(specs));

export const fetch = _fetch(fetcherSpecs);

/**
 * A provider that provides the data
 */
export const AppContextProvider = ({
  ajaxInjections,
  children,
  featureFlagsSvc,
  actionDispatcher,
  navigationService,
  appContextService,
}) => {
  const [appContext, setAppContext] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const refreshRemoteData = async () => {
    setIsLoading(true);
    setAppContext(await fetch(ajaxInjections));
    setIsLoading(false);
  };

  useEffect(() => {
    refreshRemoteData();
  }, [ajaxInjections]);

  useEffect(() => {
    setAppContext(R.set(lens.featureFlagsSvc, featureFlagsSvc));
  }, [featureFlagsSvc]);

  useEffect(() => {
    setAppContext(R.set(lens.actionDispatcher, actionDispatcher));
  }, [actionDispatcher]);

  useEffect(() => {
    setAppContext(R.set(lens.navigationService, navigationService));
  }, [navigationService]);

  useEffect(() => {
    setAppContext(R.set(lens.appContextService, appContextService));
  }, [appContextService]);

  return (
    <LoadingWrapper isLoading={isLoading}>
      {children({appContext, refreshRemoteData})}
    </LoadingWrapper>
  );
};
