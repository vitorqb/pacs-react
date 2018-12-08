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
    getTransactions(axiosWrapper).then(transactions => {
      this.setState({
        isLoaded: true,
        transactions
      })
    })
  }

  render() {
    const { transactions } = this.state;
    let transactionTable;

    // !!!! Refactor to own function
    if (transactions == null) {
      transactionTable = <p>Loading...</p>;
    } else {
      transactionTable = (
        <TransactionTable
          title="Recent Transactions"
          transactions={transactions} />
      )
    }
              
    return (
      <div className="App">{transactionTable}</div>
    );
  }

}

export default App;
