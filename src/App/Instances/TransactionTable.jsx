import React from 'react';
import { lens as AppLens } from '../Lens';
import * as R from 'ramda';
import TransactionTable from "../../components/TransactionTable";
import { lens as AjaxInjectionsLens } from '../Ajax';

export default function TransactionTableInstance({ state, stateGetters, ajaxInjections }) {
  const currencies = R.view(AppLens.currencies, state);
  const accounts = R.view(AppLens.accounts, state);
  const getPaginatedTransactions = R.view(AjaxInjectionsLens.getPaginatedTransactions,
                                          ajaxInjections);
  if (R.isNil(currencies) || R.isNil(accounts)) {
    return <p>Loading...</p>;
  };
  return (
    <div className="transaction-table-instance">
      <TransactionTable
        getCurrency={R.view(AppLens.currencies, stateGetters)}
        getAccount={R.view(AppLens.accounts, stateGetters)}
        getPaginatedTransactions={getPaginatedTransactions}
      />
    </div>
  );
};
