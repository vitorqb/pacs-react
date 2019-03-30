import React, { Component } from 'react';
import TransactionPicker from './TransactionPicker';
import TransactionForm from './TransactionForm';
import ErrorMessage from './ErrorMessage.jsx';
import SuccessMessage from './SuccessMessage.jsx';
import { getSpecFromTransaction } from '../utils.jsx';

/**
 * A component used to edit a transaction.
 */
export default class EditTransactionComponent extends Component {

  /**
   * @param {object} props
   * @param {fn(number): Promise<Transaction>} props.getTransaction - A function
   *   that maps a pk to a Promise with a Transaction.
   * @param {fn(Transaction, TransactionSpec): Promise} props.updateTransaction - 
   *   A function that receives the specification for a transaction and performs the 
   *   request to update it.
   * @param {Account[]} props.accounts - An array with all known accounts.
   * @param {Currency[]} props.currencies - An array with all known currencies.
   */
  constructor(props) {
    super(props);
    this.state = {
      transaction: null,
      transactionSpec: null,
      errMsg: "",
      sucMsg: ""
    };
  }

  setTransaction = transaction => {
    // Not only we set the transaction, but we assume that if the transaction
    // is being set we also want to update the transaction specification with
    // it.
    this.setState({
      transaction,
      transactionSpec: getSpecFromTransaction(transaction)
    });
  }

  setTransactionSpec = transactionSpec => {
    this.setState({transactionSpec});
  }

  setSuccessMessage = sucMsg => {
    this.setState({sucMsg})
  }

  setErrorMessage = errMsg => {
    this.setState({errMsg})
  }

  handleSubmit = transactionSpec => {
    const { updateTransaction } = this.props;
    const { transaction } = this.state;
    const onSuccessUpdate = () => {
      this.setErrorMessage("");
      this.setSuccessMessage("Success!");
    };
    const onFailedUpdate = (err) => {
      this.setSuccessMessage("");
      this.setErrorMessage(err);
    };
    
    return updateTransaction(transaction, transactionSpec)
      .then(onSuccessUpdate)
      .catch(onFailedUpdate)
  }

  render() {
    const { getTransaction } = this.props;
    return (
      <div>
        <TransactionPicker
          getTransaction={getTransaction}
          onPicked={this.setTransaction} />
        {this.renderCreateTransactionComponent()}
        <ErrorMessage value={this.state.errMsg} />
        <SuccessMessage value={this.state.sucMsg} />
      </div>
    )
  }

  renderCreateTransactionComponent() {
    const { transactionSpec } = this.state;
    const { accounts, currencies } = this.props;

    if (transactionSpec === null || transactionSpec === undefined) {
      return null;
    }
    return (<TransactionForm
            onSubmit={this.handleSubmit}
            onChange={this.setTransactionSpec}
            accounts={accounts}
            currencies={currencies}
            value={transactionSpec} />);
  }

}
