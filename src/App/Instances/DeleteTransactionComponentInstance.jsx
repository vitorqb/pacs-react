import React from 'react';
import DeleteTransactionComponent from '../../components/DeleteTransactionComponent.jsx';
import * as R from 'ramda';
import * as Ajax from '../Ajax.jsx';
import * as AppContext from '../AppContext.jsx';


export const DeleteTransactionComponentInstance = (renderArgs) => {
  const { ajaxInjections, appContextGetters } = renderArgs;
  const getTransaction = R.view(Ajax.lens.getTransaction, ajaxInjections);
  const getAccount = R.view(AppContext.lens.accounts, appContextGetters);
  const getCurrency = R.view(AppContext.lens.currencies, appContextGetters);
  return (
    <DeleteTransactionComponent
      getTransaction={getTransaction}
      getAccount={getAccount}
      getCurrency={getCurrency}
    />
  );
};


export default DeleteTransactionComponentInstance;
