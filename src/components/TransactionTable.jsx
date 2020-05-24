import React, { useState } from 'react';
import * as R from 'ramda';
import { getTargetAccsPks, getSourceAccsPks } from '../utils';
import { DateUtil } from '../utils';
import ReactTable from 'react-table';

import "../css/components/_transaction-table.scss";

const movementCurrencyLens = R.lensPath(["money", "currency"]);
const quantityCurrencyLens = R.lensPath(["money", "quantity"]);

/**
  * A React Component that is a table of transactions
  * @param props.getCurrency - A function that maps a pk to a Currency.
  * @param props.getAccount - A function that maps a pk to an Account.
  * @param props.getPaginatedTransactions - A function that is used to get paginated transactions.
  */
export function TransactionTable({ getCurrency, getAccount, getPaginatedTransactions }) {

  // State
  const [paginatedTransactions, setPaginatedTransactions] = useState({items: [], page: -1});
  const pageState = useState(0);
  const pageSizeState = useState(100);
  const searchTermInputState = useState("");
  const committedSearchTermState = useState("");

  // Helpers
  const getAndSetPaginatedTransactions = args => {
    return getPaginatedTransactions(args).then(setPaginatedTransactions);
  };

  // Handler for user committing to a search term
  const onSearchTermCommitted = (newSearchTerm) => {
    const args = {page: 0, pageSize: pageSizeState[0], description: newSearchTerm};
    committedSearchTermState[1](newSearchTerm);
    pageState[1](0);
    return getAndSetPaginatedTransactions(args);
  };

  // Header with search term
  const headerOpts = {searchTermState: searchTermInputState, onSearchTermCommitted};
  const header = transactionTableHeader.genElement(headerOpts);

  // Handle transaction fetching
  const onFetchTransactionsHandler = R.pipe(
    TransactionFetcher.extractArgsFromReactTableState,
    TransactionFetcher.withSearchTerm(committedSearchTermState[0]),
    getPaginatedTransactions,
    R.andThen(setPaginatedTransactions)
  );

  // Mounts
  return (
    <TransactionTableCore
      getCurrency={getCurrency}
      getAccount={getAccount}
      onFetchTransactionsHandler={onFetchTransactionsHandler}
      paginatedTransactions={paginatedTransactions}
      header={header}
      pageState={pageState}
      pageSizeState={pageSizeState}
    />
  );
}

export default TransactionTable;

/**
 * "Pure" version of TransactionTable, without state management. Simply receive options,
 * parse them to the ReactTable columns and render.
 */
export function TransactionTableCore(
  {getCurrency,
   getAccount,
   onFetchTransactionsHandler,
   paginatedTransactions,
   header,
   pageState,
   pageSizeState}
) {
  const opts = {getCurrency, getAccount, onFetchTransactionsHandler, pageState, pageSizeState, header};
  const reactTableProps = ReactTableProps.gen(opts, paginatedTransactions);
  return (
    <div className="transactions-table">
      <h3>{"Transactions Table"}</h3>
      <div className="transaction-table__header">{header}</div>
      <ReactTable {...reactTableProps} />
    </div>
  );
}

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
  gen({getAccount, getCurrency, onFetchTransactionsHandler, pageState, pageSizeState}, paginatedTransactions) {
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
      page: pageState[0],
      onPageChange: pageState[1],
      pageSize: pageSizeState[0],
      onPageSizeChange: pageSizeState[1]
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
   * Extracts arguments from the ReactTable state.
   */
  extractArgsFromReactTableState: ({page, pageSize}) => {
    return { page, pageSize };
  },

  /**
   * Adds a SearchTerm to the arguments, if any.
   */
  withSearchTerm: (searchTerm) => R.unless(
    () => searchTerm === "",
    R.assoc("description", searchTerm)
  ),
  
};


/**
 * Helper functionality to generate the header 
 */
export const transactionTableHeader = {

  /**
   * Generates a header element.
   */
  genElement({searchTermState, onSearchTermCommitted}) {
    const [searchTerm, setSearchTerm] = searchTermState;
    const handleChange = transactionTableHeader._searchTermChangeHandler(setSearchTerm);
    return (
      <div className="transaction-table-header">
        <form onSubmit={e => { e.preventDefault(); onSearchTermCommitted(searchTerm); }}>
          <input
            className="transaction-table-header__input"
            placeholder="SearchTerm"
            type="text"
            value={searchTerm}
            onChange={handleChange}
          />
          <button className="transaction-table-header__button">
            {"Search"}
          </button>
        </form>
      </div>
    );
  },
  
  /**
   * Handles changes on the `input` of the search term.
   * @param setSearchTerm - A function that set's the search term into some state.
   * @param event - The input change event.
   */
  _searchTermChangeHandler: R.curry((setSearchTerm, event) => {
    event.preventDefault();
    setSearchTerm(event.target.value);
  }),

};
