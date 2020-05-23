import React, { Component } from 'react';
import * as RU from '../ramda-utils';
import * as R from 'ramda';
import TransactionForm from './TransactionForm.jsx';
import TransactionPicker from './TransactionPicker.jsx';
import InputWrapper, { propLens as InputWrapperLens } from './InputWrapper';

/**
 * A wrapper around TransactionForm used to create a Transaction.
 */
export default class CreateTransactionComponent extends Component {

  /**
   * @param {object} props
   * @param {function(TransactionSpec): Promise} createTransaction - A function
   *   that performs the creation of a Transaction from a TransactionSpec.
   * @param getTransaction - A function that fetches a transaction from a pk.
   */
  constructor(props) {
    super(props);
    this.state = {transactionSpec: null};
  }

  handleTransactionFormChange = transactionSpec => {
    this.setState({transactionSpec});
  }

  handleTransactionFormSubmit = transactionSpec => {
    return this.props.createTransaction(transactionSpec);
  }

  renderTemplatePicker = () => (
    <TemplatePicker
      getTransaction={this.props.getTransaction}
      onPicked={this.handleTransactionFormChange}
    />
  )

  render() {
    const templatePicker = this.renderTemplatePicker();
    return (
      <TransactionForm
        title="Create Transaction Form"
        accounts={this.props.accounts}
        currencies={this.props.currencies}
        onChange={this.handleTransactionFormChange}
        onSubmit={this.handleTransactionFormSubmit}
        value={this.state.transactionSpec}
        templatePicker={templatePicker}
      />
    );
  }
  
}


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
export function transactionToTemplateSpec(transaction) {
  return R.pipe(R.dissoc('date'), R.dissoc('pk'))(transaction);
}

// Constants
export const TEMPLATE_PICKER_LABEL = "Use transaction as Template";
