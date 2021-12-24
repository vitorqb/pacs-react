import React from 'react';
import DeleteTransactionComponent from '../../components/DeleteTransactionComponent.jsx';
import * as R from 'ramda';
import * as Ajax from '../Ajax.jsx';


export const DeleteTransactionComponentInstance = (renderArgs) => {
  const { ajaxInjections } = renderArgs;
  const getTransaction = R.view(Ajax.lens.getTransaction, ajaxInjections);
  return (
    <DeleteTransactionComponent
      getTransaction={getTransaction}
    />
  );
};


export default DeleteTransactionComponentInstance;
