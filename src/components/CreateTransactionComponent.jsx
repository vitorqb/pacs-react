import React, { Component } from 'react';
import TransactionForm from './TransactionForm.jsx';


/**
 * A wrapper around TransactionForm used to create a Transaction.
 */
export default class CreateTransactionComponent extends Component {

  /**
   * @param {object} props
   * @param {function(TransactionSpec): Promise} createTransaction - A function
   *   that performs the creation of a Transaction from a TransactionSpec.
   */
  constructor(props) {
    super(props);
    this.state = {transactionSpec: null};
  }

  handleTransactionFormChange = transactionSpec => {
    this.setState({transactionSpec})
  }

  handleTransactionFormSubmit = transactionSpec => {
    return this.props.createTransaction(transactionSpec)
  }

  render() {
    return (
      <TransactionForm
        title="Create Transaction Form"
        accounts={this.props.accounts}
        currencies={this.props.currencies}
        onChange={this.handleTransactionFormChange}
        onSubmit={this.handleTransactionFormSubmit}
        value={this.state.transactionSpec} />
    )
  }
  
}
