// This module contains all functions that performs ajax requests
import axios from 'axios';


export function ajaxGetRecentTransactions(axios) {
  // (Axios) -> [Transaction]
  // Get all recent transactions and returns them. Anything that
  // behaves like Axios is accepted as input.
  // !!!! FIXME -> Dont hardcore url
  const url = "/transactions/"
  const parseResponse = resp => resp.data

  return axios.get(url).then(parseResponse)
}

// !!!! TODO
export const axiosWrapper = axios;
