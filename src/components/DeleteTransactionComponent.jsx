import React, { useState } from 'react';
import "./DeleteTransactionComponent.module.scss";
import TransactionDisplayer from './TransactionDisplayer.jsx';
import TransactionPicker from './TransactionPicker';
import * as R from 'ramda';


export const DeleteButton = (props) => {
  return (
    <button data-testid="delete-button" type="submit">Delete</button>
  );
};


export const DeleteTransactionComponent = (props) => {
  const { getTransaction } = props;
  const [pickedTransaction, setPickedTransaction] = useState(null);
  return (
    <div>
      <TransactionPicker getTransaction={getTransaction} onPicked={setPickedTransaction} />
      {pickedTransaction && <TransactionDisplayer transaction={pickedTransaction}/>}
      {pickedTransaction && <DeleteButton/>}
    </div>
  );
};


export default DeleteTransactionComponent;
