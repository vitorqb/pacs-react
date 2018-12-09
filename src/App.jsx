import React, { Component } from 'react';
import './App.css';
import TransactionTable from "./components/TransactionTable";
import { axiosWrapper, ajaxGetRecentTransactions } from "./ajax";


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
    const { transactions } = this.state;
    const transactionTable = App.renderTransactionTable(transactions);
              
    return <div className="App">{transactionTable}</div>;
  }

  static renderTransactionTable(transactions) {
    // Renders the transactionTable or a loading <p> if transactions is null
    if (transactions) {
      return (
        <TransactionTable title="Recent Transactions" transactions={transactions} />
      )
    } else {
      return <p>Loading...</p>
    }
  }

}

export default App;
