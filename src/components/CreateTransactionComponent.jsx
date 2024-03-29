import React, { useState } from 'react';
import * as RU from '../ramda-utils';
import * as R from 'ramda';
import TransactionForm from './TransactionForm.jsx';
import TransactionPicker from './TransactionPicker.jsx';
import InputWrapper, { propLens as InputWrapperLens } from './InputWrapper';
import { getSpecFromTransaction } from '../utils';

/**
 * A wrapper around TransactionForm used to create a Transaction.
 */
export const CreateTransactionComponentCore = (props) => {

  const { transactionSpecState, createTransaction, getTransaction, accounts, currencies } = props;

  const handleTransactionFormChange = transactionSpec => {
    return transactionSpecState[1](transactionSpec);
  };
  
  return (
    <TransactionForm
      title="Create Transaction Form"
      accounts={accounts}
      currencies={currencies}
      onChange={handleTransactionFormChange}
      onSubmit={transactionSpec => {
        return createTransaction(transactionSpec);
      }}
      value={transactionSpecState[0]}
      templatePicker={
        <TemplatePicker
          getTransaction={getTransaction}
          onPicked={handleTransactionFormChange}
        />
      }
    />
  );

};

export const CreateTransactionComponent = (props) => {
  const { createTransaction, accounts, currencies, getTransaction } = props;
  const transactionSpecState = useState(null);
  return (
    <CreateTransactionComponentCore
      createTransaction={createTransaction}
      accounts={accounts}
      currencies={currencies}
      transactionSpecState={transactionSpecState}
      getTransaction={getTransaction}
    />
  );
};

export default CreateTransactionComponent;


/**
 * A custom instance of TransactionPicker used by the CreateTransactionComponent to
 * allow users to pick a template.
 * @param getTransaction - A function that fetches a transaction from a pk.
 */
export function TemplatePicker({getTransaction, onPicked}) {
  const onTransactionPicked = R.pipe(transactionToTemplateSpec, onPicked);
  const picker = (
    <TransactionPicker
      onPicked={onTransactionPicked}
      getTransaction={getTransaction} />
  );
  const inputWrapperProps = RU.objFromPairs(
    InputWrapperLens.label, TEMPLATE_PICKER_LABEL,
    InputWrapperLens.content, picker,
  );
  return <InputWrapper {...inputWrapperProps} />;;
}

/**
 * Adapts a picked Transaction into a TransactionSpec, serving as a template for the
 * picked transaction.
 */
export const transactionToTemplateSpec = R.pipe(
  getSpecFromTransaction,
  R.dissoc('date'),
  R.dissoc('pk')
);

// Constants
export const TEMPLATE_PICKER_LABEL = "Use transaction as Template";
