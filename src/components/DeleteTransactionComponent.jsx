import React, { useState } from 'react';
import "./DeleteTransactionComponent.module.scss";
import TransactionDisplayer from './TransactionDisplayer.jsx';
import TransactionPicker from './TransactionPicker';
import * as R from 'ramda';
import ErrorMessage from './ErrorMessage.jsx';


export const DeleteButton = (props) => {
  const { deletionRequestedState } = props;
  const [deletionRequested, setDeletionRequested] = deletionRequestedState;
  return (
    <button
      disabled={deletionRequested}
      data-testid="delete-button"
      type="submit"
      onClick={() => setDeletionRequested(true)}
    >
      Delete
    </button>
  );
};


export const DeleteTransactionComponentCore = (props) => {
  const {
    getTransaction,
    getAccount,
    getCurrency,
    pickedTransactionState,
    errorMessageState,
    deletionRequestedState
  } = props;
  const [pickedTransaction, setPickedTransaction] = pickedTransactionState;
  const [errorMessage, setErrorMessage] = errorMessageState;
  const [deletionRequested, setDeletionRequested] = deletionRequestedState;
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
       />}
      {pickedTransaction &&
       <DeleteButton deletionRequestedState={deletionRequestedState}/>}
      <ErrorMessage value={errorMessage} />
    </div>
  );
};

export const DeleteTransactionComponent = (props) => {
  const pickedTransactionState = useState(null);
  const errorMessageState = useState(null);
  const deletionRequestedState = useState(null);
  const enrichedProps = {...props, pickedTransactionState, errorMessageState, deletionRequestedState};
  return <DeleteTransactionComponentCore {...enrichedProps}/>;
};


export default DeleteTransactionComponent;
