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
  getTransactions: R.lensPath(['getTransactions']),
  getAccounts: R.lensPath(['getAccounts']),
  getCurrencies: R.lensPath(['getCurrencies']),
  getPaginatedJournalDataForAccount: R.lensPath(['getPaginatedJournalDataForAccount']),
  getAccountBalanceEvolutionData: R.lensPath(['getAccountBalanceEvolutionData']),
  getAccountsFlowsEvolutionData: R.lensPath(['getAccountsFlowsEvolutionData']),
  fetchCurrencyExchangeRateData: R.lensPath(['fetchCurrencyExchangeRateData']),
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
  [lens.getTransactions, ajax.ajaxGetRecentTransactions],
  [lens.getAccounts, ajax.ajaxGetAccounts],
  [lens.getCurrencies, ajax.ajaxGetCurrencies],
  [lens.getPaginatedJournalDataForAccount, ajax.ajaxGetPaginatedJournalDataForAccount],
  [lens.getAccountBalanceEvolutionData, ajax.ajaxGetAccountBalanceEvolutionData],
  [lens.getAccountsFlowsEvolutionData, ajax.ajaxGetAccountsFlowsEvolutionData],
  [lens.fetchCurrencyExchangeRateData, ajax.ajaxFetchCurrencyExchangeRateData],
];

/**
 * Returns an object with all lenses set from ajaxInjectionSpec.
 */
export const ajaxInjections = axiosWrapper => R.reduce(
  (acc, [l, fn]) => R.set(l, fn(axiosWrapper), acc),
  {},
)(ajaxInjectionSpec);
