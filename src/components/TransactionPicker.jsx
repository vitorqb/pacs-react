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
 */
  constructor(props) {
    super(props);
    this.state = {pk: ""};
  }

  handlePkChange = e => {
    this.setState({pk: e.target.value});
  }

  handleSubmit = (e) => {
    const { pk } = this.state;
    const handleGottenTransaction = (transaction) => {
      this.props.onPicked(transaction);
    };    
    e.preventDefault();
    return this.props.getTransaction(pk).then(handleGottenTransaction);
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
