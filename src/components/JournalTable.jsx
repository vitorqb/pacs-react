import { createElement } from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import * as R from 'ramda';

import { extractMoneysForAccount, moneysToRepr } from '../utils.jsx';

/**
 * A table to render an account Journal.
 * @param {object} props
 * @param {Account} props.account - The account for which the journal is
 *   being made.
 * @param {function(number) -> Account} props.getAccount
 * @param {function(Account, Account) -> bool} props.isDescendant - Returns
 *   true if the first account is descendant of the second.
 * @param {function(number): Currency)} props.getCurrency - A function that
 *   returns a currency from a pk.
 * @param {PaginatedJournalData|null} props.paginatedJournalData - An object
 *   with the paginated data to be displayed. The `null` value indicates
 *   that no data has been displayed yet.
 * @param {fn(() -> Column)[]} props.columnMakers - A list of functions that
 *   are called to generate the Column objects passed to ReactTable.
 * @param {fn(Object -> ?)} props.onFetchData - A function that
 *   signals the need to fetch new data. It passes the page that was
 *   requested and the pageSize that should be considered.
 */
export default function JournalTable(props) {
  const {
    account,
    getAccount,
    isDescendant,
    getCurrency,
    paginatedJournalData,
    onFetchData
  } = props;
  const onFetchDataHandler = makeOnFetchDataHandler(onFetchData);

  // Prepare the columns from the functions parsed as props
  const columnMakerOpts = { account, getAccount, isDescendant, getCurrency };
  const columns = R.map(R.applyTo(columnMakerOpts), props.columnMakers);
  const columnsWithId = R.addIndex(R.map)(
    (c, i) => R.assoc('id', `${i}`, c),
    columns
  );

  // The options we are gonna use
  const reactTableOpts = {
    manual: true,
    onFetchData: onFetchDataHandler,
    columns: columnsWithId,
    sortable: false,
    filterable: false
  };

  // If we have no data yet, we need to mount with data = [] and pages = -1
  // If not, calculate rows and columns
  if (paginatedJournalData === null) {
    reactTableOpts.data = [];
    reactTableOpts.pages = -1;
  } else {
    reactTableOpts.data = R.pipe(
      R.prop('data'),
      R.props(['transactions', 'balances']),         // -> [[T], [B]]
      R.apply(R.zip),                                // -> [[T, B]]
      R.map(R.zipObj(["transaction", "balance"]))    // -> [{T, B}]
    )(paginatedJournalData);
    reactTableOpts.pages = paginatedJournalData.pageCount;
  }

  return createElement(ReactTable, reactTableOpts);
}

/**
 * Returns a handler for the ReactTable.onFetchData event. The handler
 * wraps the onFetchData and calls a higher handler with customized data.
 */
export function makeOnFetchDataHandler(callback) {
  return function onFetchDataHandler(reactTableState) {
    const { page, pageSize } = reactTableState;
    callback({ page, pageSize });
  };
};


// A namespace for all column makers
export const ColumnMakers = {
  pk() {
    return {
      Header: 'Pk',
      accessor: R.path(["transaction", "pk"])
    };
  },
  description() {
    return {
      Header: 'Description',
      accessor: R.path(["transaction", "description"])
    };
  },
  date() {
    return {
      Header: 'Date',
      accessor: R.pipe(
        R.path(["transaction", "date"]),
        x => x.format("YYYY-MM-DD")
      )
    };
  },
  quantity(opts, inject={}) {
    // Dep Inject or default
    const {
      extractMoneysForAccount_ = extractMoneysForAccount,
      moneysToRepr_ = moneysToRepr,
    } = inject;

    // Required opts
    const { account, isDescendant, getAccount, getCurrency } = opts;

    return {
      Header: 'Quantity',
      accessor: R.pipe(
        R.path(["transaction", "movements"]),
        R.partial(extractMoneysForAccount_, [getAccount, isDescendant, account]),
        R.partial(moneysToRepr_, [getCurrency])
      )
    };
  },
  balanceAfter(opts) {
    const { getCurrency } = opts;
    return {
      Header: 'Balance After',
      accessor: R.pipe(
        R.path(['balance']),
        moneysToRepr(getCurrency)
      )
    };
  }
};

export const defaultColumnMakers = R.props(
  ['pk', 'description', 'date', 'quantity', 'balanceAfter'],
  ColumnMakers
);
