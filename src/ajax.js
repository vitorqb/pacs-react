// This module contains all functions that performs ajax requests
import moment from 'moment';
import axios from 'axios';
import * as R from 'ramda';
import { remapKeys } from './utils';

//
// Contants
// 
export const REQUEST_ERROR_MSG = "Something went wrong on the http request";

//
// Axios & Requests
// 
/**
 * Extracts error data from an axios error.
 */
export const extractDataFromAxiosError =
  R.pathOr(REQUEST_ERROR_MSG, ["response", "data"])

/**
 * Extracts relevant data from an axios response.
 */
export const extractDataFromAxiosResponse = R.prop("data")

/**
 * Runs an http request.
 * @param {Axios} axios - An axios-like function.
 * @param {string} url - The url for the request.
 * @param {string} method - A string with the http verb.
 * @param {Object} requestData - The data to send.
 * @param {Function} parseResponseData - A function that receives the data of
 *   the request response and parses it.
 * @returns Whatever parseResponseData returns.
 */
export function makeRequest({
  axios,
  url,
  method = "GET",
  requestData = {},
  parseResponseData = R.identity,
}) {
  const handleSuccess = R.pipe(extractDataFromAxiosResponse, parseResponseData);
  function handleFailure(error) {
    throw extractDataFromAxiosError(error)
  }
  return axios({url, method, data: requestData})
    .then(handleSuccess)
    .catch(handleFailure);
}


// Use secrets.json to get the token
const secrets = require('./secrets.json')
export const axiosWrapper = axios.create({
  baseURL: 'http://138.68.66.242/',
  headers: {
    Authorization: "Token " + secrets.pacsAuthToken
  }
});

//
// Transactions requests
//
export const parseTransactionResponseData = R.pipe(
  R.evolve({date: moment.utc}),
  remapKeys({movements_specs: "movements"})
);

export const transactionSpecToRequestParams = R.pipe(
  R.evolve({
    date: x => x.format("YYYY-MM-DD")
  }),
  remapKeys({movements: "movements_specs"})
)

/**
 * Get all recent transactions.
 */
export function ajaxGetRecentTransactions(axios) {
  return makeRequest({
    axios,
    url: "/transactions/",
    parseResponseData: R.map(parseTransactionResponseData)
  })
}

/**
 * @function
 * Get a single transaction by pk.
 */
export const ajaxGetTransaction = R.curry(function(axios, pk) {
  return makeRequest({
    axios,
    url: `/transactions/${pk}/`,
    parseResponseData: parseTransactionResponseData
  })
})

/**
 * A curried function that receives an Axios-like and some data for
 * a transactions and sends a post request to create it.
 * @param {Axios} axios - An axios-like api to use.
 * @param {TransactionSpec} transactionSpec - A specificatino of the 
 *   transaction to be created.
 */
export const ajaxCreateTransaction = R.curry(function(axios, transactionSpec) {
    return makeRequest({
      axios,
      url: "/transactions/",
      method: "POST",
      requestData: transactionSpecToRequestParams(transactionSpec)
    })
  }
                                            )

/**
 * A curried function that receives an Axios-like and some data for a
 * transaction and sends a post request to update it.
 * @function
 * @param {Axios} axios
 * @param {Transaction} transaction - The transaction being updated.
 * @param {TransactionSpec} data - The new spec for this transaction. 
 */
export const ajaxUpdateTransaction = R.curry(function(axios, transaction, data) {
  return makeRequest({
    axios,
    url: `/transactions/${transaction.pk}/`,
    method: "PUT",
    requestData: transactionSpecToRequestParams(data)
  })
})


//
// Accounts requests
//

/**
 * Prepares the parameters to send a create account request.
 */
export const accountSpecToRequestParams = remapKeys({accType: "acc_type"});

/**
  * Sends a post request to create a new account.
  * @param {Axios} axios - An axios-like api to use.
  * @param {Object} rawParams - Params passed to the post request.
  */
export const ajaxCreateAcc = R.curry(function(axios, rawParams) {
  return makeRequest({
    axios,
    url: "/accounts/",
    method: "POST",
    requestData: accountSpecToRequestParams(rawParams)
  })
})

/**
 * Get all accounts.
 */
export function ajaxGetAccounts(axios) {
  return makeRequest({
    axios,
    url: "/accounts/",
    parseResponseData: R.map(remapKeys({acc_type: "accType"}))
  });
}

/**
 * Sends a post request to update an account.
 * @param {Axios} axios
 * @param {Account} Account - the account to update.
 * @param {AccountSpec} AccountSpec - the specification for the update.
 */
export const ajaxUpdateAccount = R.curry(function(axios, account, accountSpec) {
  return makeRequest({
    axios,
    url: `/accounts/${account.pk}/`,
    method: "PUT",
    requestData: accountSpecToRequestParams(accountSpec)
  })
})

//
// Currencies
//

/**
 * Get all currencies
 */
export function ajaxGetCurrencies (axios) {
  return makeRequest({axios, url: "/currencies/"})
};
