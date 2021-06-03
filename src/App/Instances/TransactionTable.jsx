import React from 'react';
import { lens as AppLens } from '../Lens';
import * as R from 'ramda';
import TransactionTable from "../../components/TransactionTable";
import { lens as AjaxInjectionsLens } from '../Ajax';

export default function TransactionTableInstance({ appContext, appContextGetters, ajaxInjections }) {
  const currencies = R.view(AppLens.currencies, appContext);
  const accounts = R.view(AppLens.accounts, appContext);
  const getPaginatedTransactions = R.view(AjaxInjectionsLens.getPaginatedTransactions,
                                          ajaxInjections);
  if (R.isNil(currencies) || R.isNil(accounts)) {
    return <p>Loading...</p>;
  };
  return (
    <div className="transaction-table-instance">
      <TransactionTable
        getCurrency={R.view(AppLens.currencies, appContextGetters)}
        getAccount={R.view(AppLens.accounts, appContextGetters)}
        getPaginatedTransactions={getPaginatedTransactions}
      />
    </div>
  );
};
