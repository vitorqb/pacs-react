import React, { useState } from 'react';
import * as R from 'ramda';
import { getTargetAccsPks, getSourceAccsPks } from '../utils';
import { DateUtil } from '../utils';
import ReactTable from 'react-table';

const movementCurrencyLens = R.lensPath(["money", "currency"]);
const quantityCurrencyLens = R.lensPath(["money", "quantity"]);

/**
  * A React Component that is a table of transactions
  * @param props.getCurrency - A function that maps a pk to a Currency.
  * @param props.getAccount - A function that maps a pk to an Account.
  * @param props.getPaginatedTransactions - A function that is used to get paginated transactions.
  */
export function TransactionTable({ getCurrency, getAccount, getPaginatedTransactions }) {
  const [paginatedTransactions, setPaginatedTransactions] = useState({items: [], page: -1});
  const onFetchTransactionsHandler = R.pipe(
    TransactionFetcher.fetchFromReactTableState({getPaginatedTransactions}),
    R.then(setPaginatedTransactions)
  );
  const opts = {getCurrency, getAccount, onFetchTransactionsHandler};
  return (
    <div className="transactions-table">
      <h3>{"Transactions Table"}</h3>
      <ReactTable {...ReactTableProps.gen(opts, paginatedTransactions)} />
    </div>
  );
}

export default TransactionTable;

/**
 * Given an array of transactions, extracts a string representing the quantity
 * moved. If more than one currency, returns '(Multiple Currencies)'.
 * @param {Function[]} getCurrency - A function that receives the PK of a 
 *   currency and returns the currency.
 * @param {Movement[]} movements
 * @returns {string}
 */
export const extractQuantityMoved = R.curry((getCurrency, movements) => {
  const currenciesPks = R.map(R.view(movementCurrencyLens), movements);
  const currenciesPksSet = R.uniq(currenciesPks);
  if (currenciesPksSet.length > 1) {
    return '(Multiple Currencies)';
  }
  const currency = getCurrency(currenciesPksSet[0]);
  const quantities = R.map(R.view(quantityCurrencyLens), movements);
  const totalQuantity = R.sum(R.filter(x => x > 0, quantities));
  return `${totalQuantity} ${currency.name}`;
});

/**
 * Given an array of movements, extracts a string representing the accounts
 * in that transaction.
 * @param {Function[]} getAccount - A function that maps a pk into an Account.
 * @param {Movement[]} movements
 * @return {string}
 */
export const extractAccountsRepr = R.curry((getAccount, movements) => {

  function buildAccsRepr(accounts) {
    const namesList = R.map(R.prop("name"), accounts);
    const namesRepr = R.join(", ", namesList);
    if (accounts.length === 1) {
      return namesRepr;
    }
    return "(" + namesRepr + ")";
  }

  const sourceAccs = R.map(getAccount, getSourceAccsPks(movements));
  const targetAccs = R.map(getAccount, getTargetAccsPks(movements));
  return `${buildAccsRepr(sourceAccs)} -> ${buildAccsRepr(targetAccs)}`;
});

/**
 * Helper object for generating props for the react table.
 */
export const ReactTableProps = {

  /**
   * Generates props for the react table.
   */
  gen({getAccount, getCurrency, onFetchTransactionsHandler}, paginatedTransactions) {
    return {
      columns: [
        {
          id: "pk",
          Header: 'Pk',
          accessor: R.path(["pk"]),
          width: WIDTHS.smaller,
        },
        {
          id: "description",
          Header: 'Description',
          accessor: R.path(["description"])
        },
        {
          id: "date",
          Header: 'Date',
          accessor: R.pipe(R.path(["date"]), DateUtil.format),
          width: WIDTHS.small,
        },
        {
          id: "quantity",
          Header: 'Quantity',
          accessor: R.pipe(
            R.path(["movements"]),
            extractQuantityMoved(getCurrency)
          ),
          width: WIDTHS.small,
          style: {textAlign: "left"}
        },
        {
          id: "accounts",
          Header: 'Accounts',
          accessor: R.pipe(R.path(["movements"]), extractAccountsRepr(getAccount))
        }
      ],
      manual: true,
      onFetchData: onFetchTransactionsHandler,
      sortable: false,
      filterable: false,
      data: paginatedTransactions.items || [],
      pages: paginatedTransactions.pageCount || -1,
    };
  },
};

/**
 * The available widhts.
 */
export const WIDTHS = {
  smaller: 75,
  small: 125,
};

/**
 * Service responsible to fetch the paginated transactions on demand.
 */
export const TransactionFetcher = {

  /**
   * Fetches the data. Returns a promise with the fetched data.
   */
  fetch: R.curry(({getPaginatedTransactions}, {page, pageSize}) => {
    return getPaginatedTransactions({page, pageSize});
  }),

  /**
   * Fetches from the ReactTable state.
   */
  fetchFromReactTableState: R.curry(({getPaginatedTransactions}, reactTableState) => {
    return TransactionFetcher.fetch(
      {getPaginatedTransactions},
      {
        page: reactTableState.page,
        pageSize: reactTableState.pageSize
      }
    );
  }),
  
};
