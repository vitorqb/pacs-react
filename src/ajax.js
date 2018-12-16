// This module contains all functions that performs ajax requests
import moment from 'moment';
import axios from 'axios';
import * as R from 'ramda';

export const REQUEST_ERROR_MSG = "Something went wrong on the http request";

/**
 * Extracts error data from an axios error.
 */
export function extractDataFromAxiosError(error) {
  if (error && error.response) {
    return error.response.data
  }
  return REQUEST_ERROR_MSG
}

/**
 * Extracts relevant data from an axios response.
 */
export function extractDataFromAxiosResponse(response) {
  return response.data
}

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

export function ajaxGetRecentTransactions(axios) {
  // (Axios) -> [Transaction]
  // Get all recent transactions and returns them. Anything that
  // behaves like Axios is accepted as input.
  // !!!! FIXME -> Dont hardcore url
  const url = "/transactions/"
  const parseResponse = resp => resp.data
  const parseTransaction = R.evolve({date: moment.utc})

  return axios.get(url).then(parseResponse).then(R.map(parseTransaction))
}

/**
  * Sends a post request to create a new account.
  * @param {Axios} axios - An axios-like api to use.
  * @param {Object} rawParams - Params passed to the post request.
  */
export function ajaxCreateAcc(axios, rawParams) {

  /**
    * Prepares a parameter of accounts to the post request.
    * @param {Any} key - The key of the param.
    * @param {Any} value - The value of the param.
    * @returns {Object} The parsed object.
    */
  function prepareRawParamForPost([key, value]) {
    switch (key) {
    case "accType":
      return ["acc_type", value]
    default:
      return [key, value]
    }
  }

  const url = "/accounts/"
  const parseResponse = resp => resp.data
  const params = R.fromPairs(
    R.toPairs(rawParams).map(prepareRawParamForPost)
  )
  return axios.post(url, params).then(parseResponse)
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
function _ajaxCreateTransaction(axios, { description, date, movements }) {
  // !!!! DOnt hardocde url
  const url = "/transactions/";

  function parseMovement(m) {
    const money = R.pick(["currency", "quantity"], m);
    return {account: m.account, money }
  }

  function parseError(e) {
    if (e.response) {
      throw e.response.data
    }
    throw e
  }

  function parseResponse(resp) {
    if (!resp || !resp.data) {
      return resp
    }
    return resp.data
  }

  const parsedData = {
    description,
    date,
    movements_specs: movements ? movements.map(parseMovement) : []
  }

  return axios.post(url, parsedData).catch(parseError).then(parseResponse)
}

export const ajaxCreateTransaction = R.curry(_ajaxCreateTransaction);

                                             
// !!!! TODO -> Dont hardcore token (how?)
// !!!! TODO -> Parse response and errors here according to server API.
export const axiosWrapper = axios.create({
  baseURL: 'http://138.68.66.242/',
  headers: {
    Authorization: "Token {$,<6$X*~vEdZw;>YN(!64=sKTv!@G*&&Kc)Mgwb.z5hM>>U=T"
  }
});
