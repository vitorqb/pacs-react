// This module contains all functions that performs ajax requests
import axios from 'axios';
import * as R from 'ramda';

export function ajaxGetRecentTransactions(axios) {
  // (Axios) -> [Transaction]
  // Get all recent transactions and returns them. Anything that
  // behaves like Axios is accepted as input.
  // !!!! FIXME -> Dont hardcore url
  const url = "/transactions/"
  const parseResponse = resp => resp.data

  return axios.get(url).then(parseResponse)
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

// TODO -> Dont hardcore token (how?)
export const axiosWrapper = axios.create({
  baseURL: 'http://138.68.66.242/',
  headers: {
    Authorization: "Token {$,<6$X*~vEdZw;>YN(!64=sKTv!@G*&&Kc)Mgwb.z5hM>>U=T"
  }
});
