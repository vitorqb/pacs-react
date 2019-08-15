import React from 'react';
import { lens as AppLens } from '../Lens';
import * as R from 'ramda';
import TransactionTable from "../../components/TransactionTable";

export default function TransactionTableInstance({ state, stateGetters, ajaxInjections }) {
  const transactions = R.view(AppLens.transactions, state);
  const currencies = R.view(AppLens.currencies, state);
  const accounts = R.view(AppLens.accounts, state);
  if (R.isNil(transactions) || R.isNil(currencies) || R.isNil(accounts)) {
    return <p>Loading...</p>;
  };
  return (
    <div className="transaction-table-instance">
      <TransactionTable
        title="Recent Transactions"
        transactions={transactions}
        getCurrency={R.view(AppLens.currencies, stateGetters)}
        getAccount={R.view(AppLens.accounts, stateGetters)} />
    </div>
  );
};
