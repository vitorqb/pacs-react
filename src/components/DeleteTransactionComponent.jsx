import React, { useState } from 'react';
import styles from "./DeleteTransactionComponent.module.scss";
import TransactionDisplayer from './TransactionDisplayer.jsx';
import TransactionPicker from './TransactionPicker';
import * as R from 'ramda';
import ErrorMessage from './ErrorMessage.jsx';

export const DeletionConfirmationBox = (props) => {
  const { deletionRequestedState } = props;
  const [deletionRequested, setDeletionRequested] = deletionRequestedState;
  return (
    <div className={styles.deletionConfirmationBox}>
      {"Are you sure you want to delete this transaction?"}
      <div>
        <button>Yes</button>
        <button onClick={() => setDeletionRequested(false)}>No</button>
      </div>
    </div>
  );
};

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
    <div className={styles.deleteTransactionComponent}>
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
       <div className={styles.transactionDisplayerWrapper}>
         <TransactionDisplayer
           transaction={pickedTransaction}
           getAccount={getAccount}
           getCurrency={getCurrency}
         />
       </div>}
      {pickedTransaction &&
       <DeleteButton deletionRequestedState={deletionRequestedState}/>}
      {deletionRequested &&
       <DeletionConfirmationBox deletionRequestedState={deletionRequestedState} />}
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
