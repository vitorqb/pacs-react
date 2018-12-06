import React, { Component } from 'react';
import './App.css';
import TransactionTable from "./components/TransactionTable"

class App extends Component {
  render() {
    return (
      <div className="App">
        <TransactionTable title="Recent Transactions" transactions={[]} />
      </div>
    );
  }
}

export default App;
