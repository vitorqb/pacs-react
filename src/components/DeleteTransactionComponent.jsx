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


export const DeleteTransactionComponentCore = (props) => {
  const { getTransaction, getAccount, getCurrency, transactionState, errorMessageState } = props;
  const [pickedTransaction, setPickedTransaction] = transactionState;
  const [errorMessage, setErrorMessage] = errorMessageState;
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
       <TransactionDisplayer
         transaction={pickedTransaction}
         getAccount={getAccount}
         getCurrency={getCurrency}
       />
      }
      {pickedTransaction && <DeleteButton/>}
      <ErrorMessage value={errorMessage} />
    </div>
  );
};

export const DeleteTransactionComponent = (props) => {
  const transactionState = useState(null);
  const errorMessageState = useState(null);
  const enrichedProps = {...props, transactionState, errorMessageState};
  return <DeleteTransactionComponentCore {...enrichedProps}/>;
};


export default DeleteTransactionComponent;
