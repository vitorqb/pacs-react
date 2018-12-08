import React, { Component } from 'react';
import './App.css';
import TransactionTable from "./components/TransactionTable"

class App extends Component {
  // The main application

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
    const { getTransactions } = this.props;
    getTransactions().then(transactions => {
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
