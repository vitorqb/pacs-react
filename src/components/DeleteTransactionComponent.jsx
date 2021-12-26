import React, { useState } from 'react';
import "./DeleteTransactionComponent.module.scss";
import TransactionDisplayer from './TransactionDisplayer.jsx';
import TransactionPicker from './TransactionPicker';
import * as R from 'ramda';
import ErrorMessage from './ErrorMessage.jsx';


export const DeleteButton = (props) => {
  return (
    <button data-testid="delete-button" type="submit">Delete</button>
  );
};


export const DeleteTransactionComponent = (props) => {
  const { getTransaction, getAccount } = props;
  const [pickedTransaction, setPickedTransaction] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  return (
    <div>
      <TransactionPicker
        getTransaction={getTransaction}
        onPicked={(transaction) => {
          setErrorMessage(null);
          setPickedTransaction(transaction);
        }}
        onGetTransactionFailure={(error) => {
          setPickedTransaction(null);
          setErrorMessage(error);
        }}
      />
      {pickedTransaction &&
       <TransactionDisplayer transaction={pickedTransaction} getAccount={getAccount}/>
      }
      {pickedTransaction && <DeleteButton/>}
      <ErrorMessage value={errorMessage} />
    </div>
  );
};


export default DeleteTransactionComponent;
