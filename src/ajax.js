// This module contains all functions that performs ajax requests
import moment from 'moment';
import * as R from 'ramda';
import { remapKeys, MonthUtil, DateUtil, StrUtil, PaginationUtils } from './utils';
import * as PricePortifolio from './domain/PricePortifolio/Core';

//
// Contants
// 
export const REQUEST_ERROR_MSG = "Something went wrong on the http request";
export const FETCH_CURRENCY_EXCHANGE_RATE_TOKEN_HEADER = "FETCH_CURRENCY_EXCHANGE_RATE_TOKEN";

//
// Axios & Requests
// 
/**
 * Extracts error data from an axios error.
 */
export const extractDataFromAxiosError =
  R.pathOr(REQUEST_ERROR_MSG, ["response", "data"]);

/**
 * Extracts relevant data from an axios response.
 */
export const extractDataFromAxiosResponse = r => {
  if (! R.isNil(r.data)) { return r.data; };
  return r;
};

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
  requestParams = {},
  parseResponseData = R.identity,
  customHeaders = {}
}) {
  const handleSuccess = R.pipe(extractDataFromAxiosResponse, parseResponseData);
  function handleFailure(error) {
    throw extractDataFromAxiosError(error);
  }
  return axios({url, method, data: requestData, params: requestParams, headers: customHeaders})
    .then(handleSuccess)
    .catch(handleFailure);
}

//
// Transactions requests
//
export const parseTransactionResponseData = R.pipe(
  R.evolve({date: moment.utc}),
  remapKeys({movements_specs: "movements"})
);

export const transactionSpecToRequestParams = R.pipe(
  R.evolve({date: x => x.pickedDate.format("YYYY-MM-DD")}),
  remapKeys({movements: "movements_specs"})
);


/**
 * Ns to get a paginated list of transactions.
 */
export const AjaxGetPaginatedTransactions = {

  run: (axios) => ({page=0, pageSize=20, description=null, reference=null}) => makeRequest({
    axios,
    url: AjaxGetPaginatedTransactions._makeUrl({page, pageSize, description, reference}),
    parseResponseData: AjaxGetPaginatedTransactions._parseResponse({page, pageSize})
  }),

  /**
   * Enriches the response from the call.
   */
  _parseResponse: R.curry(({page, pageSize}, response) => R.pipe(
    remapKeys({count: "itemCount"}),
    remapKeys({results: "items"}),
    R.assoc('pageCount', PaginationUtils.getPageCount({count: response.count, pageSize})),
    R.assoc('pageSize', pageSize),
    R.assoc('page', page),
    R.evolve({items: R.map(parseTransactionResponseData)}),
  )(response)),

  /**
   * Makes an url given some pagination options.
   */
  _makeUrl: ({page, pageSize, description, reference}) => {
    let result = `/transactions/?page=${page+1||1}&page_size=${pageSize||20}`;
    if (description) { result = `${result}&description=${description}`; }
    if (reference) { result = `${result}&reference=${reference}`; }
    return result;
  }
  
};

/**
 * @function
 * Get a single transaction by pk.
 */
export const ajaxGetTransaction = R.curry(function(axios, pk) {
  return makeRequest({
    axios,
    url: `/transactions/${pk}/`,
    parseResponseData: parseTransactionResponseData
  });
});

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
    });
});

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
  });
});


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
  });
});

/**
 * Get all accounts.
 */
export function ajaxGetAccounts(axios) {
  return () => makeRequest({
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
  });
});

/**
 * Sends a DELETE request to an account.
 */
export const ajaxDeleteAccount = R.curry(function(axios, account) {
  return makeRequest({
    axios,
    url: `/accounts/${account.pk}/`,
    method: "DELETE",
  });
});

/**
 * Returns a Journal for an account.
 * @function
 * @param {Axios} axios
 * @param {Account} account
 */
export const ajaxGetJournalForAccount = R.curry(function(axios, account) {
  return makeRequest({
    axios,
    url: `/accounts/${account.pk}/journal/`,
    method: "GET",
    parseResponseData: R.over(
      R.lensProp('transactions'),
      R.map(parseTransactionResponseData),
    )
  });
});

/**
 * Runs an ajax query and returns a PaginatedJournalData.
 * @function
 * @param {Axios} axios
 * @param {Account} account
 * @param {Object} paginationRequestOpts
 * @param {number} paginationRequestOpts.page
 * @param {number} paginationRequestOpts.pageSize
 */
export const ajaxGetPaginatedJournalDataForAccount = R.curry(
  function(axios, account, paginationRequestOpts) {
    return makeRequest({
      axios,
      url: makeUrlPaginatedJournalForAccount(account, paginationRequestOpts),
      method: "GET",
      parseResponseData: R.pipe(
        // Adds page and pageSize to the context of the response.
        R.mergeRight(paginationRequestOpts),
        parsePaginatedJournalResponse
      )
    });
  }
);

export const parsePaginatedJournalResponse = R.pipe(
  R.over(
    R.lensPath(['journal', 'transactions']),
    R.map(parseTransactionResponseData)
  ),
  remapKeys({journal: "data", count: "itemCount"}),
  // Adds a pageCount from pageSize and count
  (x) => R.assoc('pageCount', Math.ceil(x.itemCount / x.pageSize), x)
);

export function makeUrlPaginatedJournalForAccount(account, paginationRequestOpts) {
  const { page, pageSize } = paginationRequestOpts;
  return `/accounts/${account.pk}/journal/` +
    `?page=${page+1}&page_size=${pageSize}&reverse=1`;
}

//
// Currencies
//

/**
 * Get all currencies
 */
export function ajaxGetCurrencies (axios) {
  return () => makeRequest({axios, url: "/currencies/"});
};

//
// Reports
//
export const monthsPairToPeriods = R.pipe(
  R.apply(MonthUtil.monthsBetween),
  R.map(MonthUtil.monthToPeriod),
);

/**
 * Get the balance evolution report data for a set of accounts and months.
 * @function
 * @param {Axios} axios
 * @param {Account[]} accounts
 * @param {Month[]} months
 */
export const ajaxGetAccountBalanceEvolutionData = R.curry((axios, params) => {
  return makeRequest({
    axios,
    url: "/reports/balance-evolution/",
    method: "POST",
    requestData: getAccountBalanceEvolutionDataRequestData(params)
  });
});

export const getAccountBalanceEvolutionDataRequestData = params => {
  const accounts = R.prop('accounts', params);
  const months = R.prop('months', params);
  const portifolio = R.prop('portifolio', params.currencyOpts);
  const convertTo = R.prop('convertTo', params.currencyOpts);
  return R.pipe(
    R.assoc('accounts', R.map(R.prop('pk'), accounts)),
    R.assoc('dates', R.pipe(
      R.apply(MonthUtil.monthsBetween),
      R.map(MonthUtil.lastDayOfMonth),
    )(months)),
    R.when(
      _ => convertTo,
      R.assocPath(['currency_opts', 'convert_to'], R.prop('code', convertTo))
    ),
    R.when(
      _ => portifolio,
      x => R.assocPath(
        ['currency_opts', 'price_portifolio'],
        PricePortifolio.normalizePortifolioPrices(portifolio)
      )(x),
    )
  )({});
};

export const parseAccountBalanceEvolutionResponse = months => R.pipe(
  R.evolve({ data: R.map(R.pipe(
    remapKeys({initial_balance: 'initialBalance'}),
    remapKeys({balance_evolution: 'balanceEvolution'})
  ))}),
  R.assoc('months', months),
);

/**
  * Get the accounts flows evolution data for a set of accounts and a period.
  */
export const ajaxGetAccountsFlowsEvolutionData = R.curry(
  function(axios, {accounts, monthsPair, currencyOpts={}}) {
    const periods = monthsPairToPeriods(monthsPair);
    const portifolio = R.prop('portifolio', currencyOpts);
    const convertTo = R.prop('convertTo', currencyOpts);
    return makeRequest({
      axios,
      url: "/reports/flow-evolution/",
      method: "POST",
      requestData: R.pipe(
        R.assoc('accounts', R.map(R.prop("pk"), accounts)),
        R.assoc('periods', periods),
        x => convertTo
          ? R.assocPath(['currency_opts', 'convert_to'], R.prop('code', convertTo), x)
          : x,
        x => portifolio
          ? R.assocPath(
            ['currency_opts', 'price_portifolio'],
            R.map(
              R.over(
                R.lensProp('prices'),
                R.map(R.over(R.lensProp('price'), x => x.toFixed(5))),
              ),
              portifolio),
            x
          )
          : x,
      )({}),
      parseResponseData: R.pipe(
        R.assoc('periods', periods),
        remapKeys({"data": "accountsFlows"}),
      )
    });
  }
);

/**
 * @type Function
 * Get the json with data for the exchange rate.
 * @param axios - The axios or axios wrapper fn.
 * @param args.startAt - Start momentjs date.
 * @param args.endAt - End momentjs date.
 * @param args.currencyCodes - List with currency codes.
 */
export const ajaxFetchCurrencyExchangeRateData = R.curry(function(axios, { startAt, endAt, currencyCodes }) {
  return makeRequest({
    axios,
    url: "/exchange_rates/data/v2",
    method: "GET",
    requestParams: R.pipe(
      R.assoc("start_at", DateUtil.format(startAt)),
      R.assoc("end_at", DateUtil.format(endAt)),
      R.assoc("currency_codes", StrUtil.joinList(currencyCodes, ",")),
    )({}),
  });
});
