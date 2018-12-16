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

//
// Transactions requests
//
export const parseTransactionResponseData = R.evolve({date: moment.utc});

export function parseMovementToRequestData(movement) {
  const money = R.pick(["currency", "quantity"])(movement);
  return {account: movement.account, money}
}

export const prepareCreateTransactionParams = R.pipe(
  R.evolve({movements: R.map(parseMovementToRequestData)}),
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
 * A curried function that receives an Axios-like and some data for
 * a transactions and sends a post request to create it.
 * @param {Axios} axios - An axios-like api to use.
 * @param {Object} data - Data for transaction.
 * @param {string} data.description - Description.
 * @param {string} data.date - Date as YYYY-MM-DD.
 * @param {Movement[]} data.movements - An array of movements for this transaction,
 *    in the format {account: int, currency: int, quantity: int}
 */
export const ajaxCreateTransaction = R.curry(function(axios, params) {
    return makeRequest({
      axios,
      url: "/transactions/",
      method: "POST",
      requestData: prepareCreateTransactionParams(params)
    })
  }
)


//
// Accounts requests
//

/**
 * Prepares the parameters to send a create account request.
 */
export const prepareCreateAccParams = remapKeys({accType: "acc_type"});

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
    requestData: prepareCreateAccParams(rawParams)
  })
})
                                             
// !!!! TODO -> Dont hardcore token (how?)
// !!!! TODO -> Parse response and errors here according to server API.
export const axiosWrapper = axios.create({
  baseURL: 'http://138.68.66.242/',
  headers: {
    Authorization: "Token {$,<6$X*~vEdZw;>YN(!64=sKTv!@G*&&Kc)Mgwb.z5hM>>U=T"
  }
});
