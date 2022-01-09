import React, { useState } from 'react';
import styles from "./DeleteTransactionComponent.module.scss";
import TransactionDisplayer from './TransactionDisplayer.jsx';
import TransactionPicker from './TransactionPicker';
import * as R from 'ramda';
import ErrorMessage from './ErrorMessage.jsx';

export const DeletionConfirmationBox = (props) => {
  const { deletionRequestedState, onSubmit } = props;
  const [,setDeletionRequested] = deletionRequestedState;
  return (
    <div className={styles.deletionConfirmationBox}>
      {"Are you sure you want to delete this transaction?"}
      <div>
        <button onClick={() => onSubmit()}>Yes</button>
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
    deletionRequestedState,
    handleDeletionSubmit,
  } = props;
  const [pickedTransaction, setPickedTransaction] = pickedTransactionState;
  const [errorMessage, setErrorMessage] = errorMessageState;
  const [deletionRequested, ] = deletionRequestedState;
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
       <DeleteButton
         deletionRequestedState={deletionRequestedState}
       />}
      {deletionRequested &&
       <DeletionConfirmationBox
         deletionRequestedState={deletionRequestedState}
         onSubmit={handleDeletionSubmit}
       />}
      <ErrorMessage value={errorMessage} />
    </div>
  );
};

export const handleDeletionSubmit = R.curry(async (opts) => {
    const {
    deletionRequestedState,
    errorMessageState,
    pickedTransactionState,
    deleteTransactionFn,
  } = opts;
  const [pickedTransaction, setPickedTransaction] = pickedTransactionState;
  const [, setErrorMessage] = errorMessageState;
  const [, setDeletionRequested] = deletionRequestedState;

  try {
    await deleteTransactionFn(pickedTransaction);
  } catch (e) {
    setErrorMessage(e);
    return;
  }
  setPickedTransaction(null);
  setErrorMessage(null);
  setDeletionRequested(false);
});

export const DeleteTransactionComponent = (props) => {
  const pickedTransactionState = useState(null);
  const errorMessageState = useState(null);
  const deletionRequestedState = useState(null);
  const { deleteTransactionFn } = props;
  const handleDeletionSubmitOpts = {
      deleteTransactionFn,
      deletionRequestedState,
      errorMessageState,
      pickedTransactionState,
    };
  const enrichedProps = {
    ...R.omit(['deleteTransactionFn'], props),
    pickedTransactionState,
    errorMessageState,
    deletionRequestedState,
    handleDeletionSubmit: () => handleDeletionSubmit(handleDeletionSubmitOpts)
  };
  return <DeleteTransactionComponentCore {...enrichedProps}/>;
};


export default DeleteTransactionComponent;
