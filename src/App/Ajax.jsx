import React, { useState, useEffect } from 'react';
import * as ajax from "../ajax";
import * as R from 'ramda';

/**
 * Lenses for the ajax injections.
 */
export const lens = {
  createAcc: R.lensPath(['createAcc']),
  updateAcc: R.lensPath(['updateAcc']),
  deleteAcc: R.lensPath(['deleteAcc']),
  createTransaction: R.lensPath(['createTransaction']),
  updateTransaction: R.lensPath(['updateTransaction']),
  getTransaction: R.lensPath(['getTransaction']),
  getAccounts: R.lensPath(['getAccounts']),
  getCurrencies: R.lensPath(['getCurrencies']),
  getPaginatedTransactions: R.lensPath(['getPaginatedTransactions']),
  getPaginatedJournalDataForAccount: R.lensPath(['getPaginatedJournalDataForAccount']),
  getAccountBalanceEvolutionData: R.lensPath(['getAccountBalanceEvolutionData']),
  getAccountsFlowsEvolutionData: R.lensPath(['getAccountsFlowsEvolutionData']),
  fetchCurrencyExchangeRateDataV2: R.lensPath(['fetchCurrencyExchangeRateDataV2']),
};

/**
 * Specifications for how the ajaxInjections should be made.
 * Each item is a tuple [lens, fn]
 */
export const ajaxInjectionSpec = [
  [lens.createAcc, ajax.ajaxCreateAcc],
  [lens.updateAcc, ajax.ajaxUpdateAccount],
  [lens.deleteAcc, ajax.ajaxDeleteAccount],
  [lens.createTransaction, ajax.ajaxCreateTransaction],
  [lens.updateTransaction, ajax.ajaxUpdateTransaction],
  [lens.getTransaction, ajax.ajaxGetTransaction],
  [lens.getPaginatedTransactions, ajax.AjaxGetPaginatedTransactions.run],
  [lens.getAccounts, ajax.ajaxGetAccounts],
  [lens.getCurrencies, ajax.ajaxGetCurrencies],
  [lens.getPaginatedJournalDataForAccount, ajax.ajaxGetPaginatedJournalDataForAccount],
  [lens.getAccountBalanceEvolutionData, ajax.ajaxGetAccountBalanceEvolutionData],
  [lens.getAccountsFlowsEvolutionData, ajax.ajaxGetAccountsFlowsEvolutionData],
  [lens.fetchCurrencyExchangeRateDataV2, ajax.ajaxFetchCurrencyExchangeRateData.v2],
];

/**
 * Returns an object with all lenses set from ajaxInjectionSpec.
 */
export const ajaxInjections = axiosWrapper => R.reduce(
  (acc, [l, fn]) => R.set(l, fn(axiosWrapper), acc),
  {},
)(ajaxInjectionSpec);

/**
 * A component that provides an instance of AjaxInjections
 */
export const AjaxInjectionsProvider = ({axios, children}) => {
  const [injections, setInjections] = useState(null);
  useEffect(() => {
    setInjections(() => ajaxInjections(axios));
  }, [axios]);
  return injections ? children(injections) : <div/>;
};
