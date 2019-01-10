import React from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css'
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
 * @param {object} props.data - The data for the journal (see below).
 * @param {Transaction[]} props.data.transactions - A list of transactions for
 *   the Journal.
 * @param {Balance[]} props.data.balances - A list of balances for the journal.
 * @param {fn(() -> Column)[]} props.columnMakers - A list of functions that
 *   are called to generate the Column objects passed to ReactTable.
 */
export default function JournalTable(props) {
  const { account, getAccount, isDescendant, getCurrency, data } = props;

  // Transform data from {Transaction[], Balance[]} -> List<{transaction, balance}>
  const rows = R.pipe(
    R.props(['transactions', 'balances']),         // -> [[T], [B]]
    R.apply(R.zip),                                // -> [[T, B]]
    R.map(R.zipObj(["transaction", "balance"]))    // -> [{T, B}]
  )(data);

  // Call functions that prepare columns
  const columnMakerOpts = { account, getAccount, isDescendant, getCurrency };
  const columns = R.map(R.applyTo(columnMakerOpts), props.columnMakers);

  // Put an id to columns
  const columnsWithId = R.addIndex(R.map)(
    (c, i) => R.assoc('id', `${i}`, c),
    columns
  );

  // If we have a date header, sorts by it
  const defaultSorted = getDefaultSorted(columnsWithId);

  return (
    <ReactTable
      data={rows}
      columns={columnsWithId}
      defaultSorted={defaultSorted} />
  )
}

/**
 * Prepares the sorting of the table. If has date sort by it, else does not sort.
 */
function getDefaultSorted(columnsWithId) {
  const dateColumn = R.find(
    R.allPass([R.has('Header'), R.pipe(R.prop('Header'), R.toLower, R.equals('date'))]),
    columnsWithId
  );
  if (dateColumn) {
    return [{ id: dateColumn.id, desc: true }]
  }
  return []
}


// A namespace for all column makers
export const ColumnMakers = {
  pk() {
    return {
      Header: 'Pk',
      accessor: R.path(["transaction", "pk"])
    }
  },
  description() {
    return {
      Header: 'Description',
      accessor: R.path(["transaction", "description"])
    }
  },
  date() {
    return {
      Header: 'Date',
      accessor: R.pipe(
        R.path(["transaction", "date"]),
        x => x.format("YYYY-MM-DD")
      )
    }
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
    }
  },
  balanceAfter(opts) {
    const { getCurrency } = opts;
    return {
      Header: 'Balance After',
      accessor: R.pipe(
        R.path(['balance']),
        moneysToRepr(getCurrency)
      )
    }
  }
}

export const defaultColumnMakers = R.props(
  ['pk', 'description', 'date', 'quantity', 'balanceAfter'],
  ColumnMakers
);
