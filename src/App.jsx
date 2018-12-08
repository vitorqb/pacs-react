import React, { Component } from 'react';
import './App.css';
import TransactionTable from "./components/TransactionTable"

class App extends Component {
  render() {
    // !!!! TODO -> Pass an ajaxWrapper and get transactions from there
    const { transactions=[] } = this.props || {}
    return (
      <div className="App">
        <TransactionTable
          title="Recent Transactions"
          transactions={transactions} />
      </div>
    );
  }
}

export default App;
