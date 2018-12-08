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

// TODO -> Dont hardcore token (how?)
export const axiosWrapper = axios.create({
  baseURL: 'http://138.68.66.242/',
  headers: {
    Authorization: "Token {$,<6$X*~vEdZw;>YN(!64=sKTv!@G*&&Kc)Mgwb.z5hM>>U=T"
  }
});
