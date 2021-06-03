import React from 'react';
import { lens as AppContextLens } from '../AppContext';
import * as R from 'ramda';
import TransactionTable from "../../components/TransactionTable";
import { lens as AjaxInjectionsLens } from '../Ajax';

export default function TransactionTableInstance({ appContext, appContextGetters, ajaxInjections }) {
  const currencies = R.view(AppContextLens.currencies, appContext);
  const accounts = R.view(AppContextLens.accounts, appContext);
  const getPaginatedTransactions = R.view(AjaxInjectionsLens.getPaginatedTransactions,
                                          ajaxInjections);
  if (R.isNil(currencies) || R.isNil(accounts)) {
    return <p>Loading...</p>;
  };
  return (
    <div className="transaction-table-instance">
      <TransactionTable
        getCurrency={R.view(AppContextLens.currencies, appContextGetters)}
        getAccount={R.view(AppContextLens.accounts, appContextGetters)}
        getPaginatedTransactions={getPaginatedTransactions}
      />
    </div>
  );
};
