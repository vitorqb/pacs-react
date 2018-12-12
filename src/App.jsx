import * as R from 'ramda'
import React, { Component } from 'react';
import './App.css';
import TransactionTable from "./components/TransactionTable";
import CreateAccForm from './components/CreateAccForm';
import CreateTransactionForm from './components/CreateTransactionForm';
import { axiosWrapper, ajaxGetRecentTransactions, ajaxCreateAcc, ajaxCreateTransaction } from "./ajax";


class App extends Component {
  // The main application
  // Props here are used only for testing purposes, and their defaults
  // are the production defaults.
  // Props:
  //   getTransactions: A function that returns a promise of transactions
  //                    on .get().

  // allows external acces to the promise used in componentDidMount,
  // so we can test it.
  busy;

  constructor(props) {
    // Defines the initial state
    super(props);
    this.state = {
      isLoaded: false,
      transactions: null
    }
  }

  componentDidMount() {
    // Loads transactions and sets state on return
    const { getTransactions = ajaxGetRecentTransactions } = this.props;
    this.busy = getTransactions(axiosWrapper).then(transactions => {
      this.setState({
        isLoaded: true,
        transactions
      })
    })
  }

  render() {
    const { createAcc = ajaxCreateAcc } = this.props;
    const { createTransaction = ajaxCreateTransaction(axiosWrapper) } = this.props;
    const { transactions } = this.state;
    const transactionTable = App.renderTransactionTable(transactions);
    const createAccForm = App.renderCreateAccForm(createAcc);
    const createTransactionForm = App.renderCreateTransactionForm(createTransaction);

    return (
      <div className="App">
          {transactionTable}
          {createAccForm}
          {createTransactionForm}
      </div>
    );
  }

  static renderTransactionTable(transactions) {
    // Renders the transactionTable or a loading <p> if transactions is null
    if (transactions) {
      return (
        <div className="TransactionTableDiv">
          <TransactionTable
            title="Recent Transactions"
            transactions={transactions} />
        </div>
      )
    } else {
      return <p>Loading...</p>
    }
  }

  /**
   * Renders the CreateAccForm for the app.
   * @param {Function} createAcc - A function that receives (Axios, accRawParams)
   *    and performs the creation of the account.
   */
  static renderCreateAccForm(createAcc) {
    // We parametrize createAcc with the AxiosWrapper.
    const parametrizedCreateAcc = R.partial(createAcc, [axiosWrapper]);
    
    return (
      <div className="CreateAccFormDiv">
        <CreateAccForm title="Create Account" createAcc={parametrizedCreateAcc}/>
      </div>
    );
  }

  /**
   * Renders the CreateTransactionForm for the app.
   * @param {Function} createTransaction - A curried function that maps an
   *    Axios-like and transactionRawParameters and performs creation of
   *    the transaction.
   */
  static renderCreateTransactionForm(createTransaction) {
    return (
      <CreateTransactionForm
        title="Create Transaction"
        createTransaction={createTransaction} />
    )
  }
}

export default App;
