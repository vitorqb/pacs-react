import React, { Component } from 'react';

/**
 * A Component that prompts the user to select a Transaction.
 */
export default class TransactionPicker extends Component {

/**
 * @param {object} props
 * @param {fn(number): Promise<Transaction>} props.getTransaction - A function that
 *   maps a pk to a promise with a Transaction.
 * @param props.onPicked - A callback function called with the picked transaction.
 * @param props.onGetTransactionFailure - A callback function for when
 *   getting a transaction fails.
 */
  constructor(props) {
    super(props);
    this.state = {pk: ""};
  }

  handlePkChange = e => {
    this.setState({pk: e.target.value});
  }

  handleSubmit = async (e) => {
    let transaction;
    const { pk } = this.state;
    const { getTransaction, onGetTransactionFailure, onPicked } = this.props;
    e.preventDefault();
    try {
      transaction = await getTransaction(pk);
    } catch(e) {
      if (onGetTransactionFailure) {
        onGetTransactionFailure(e.message);
      }
      return;
    }
    onPicked(transaction);
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <input placeholder="pk" name="pk" type="number" onChange={this.handlePkChange} />
        <input type="submit"/>
      </form>
    );
  }

}
