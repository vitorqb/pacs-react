import * as R from 'ramda'
import React, { Component } from 'react';
import { BrowserRouter as Router, Link, Route } from 'react-router-dom';
import './App.css';
import TransactionTable from "./components/TransactionTable";
import CurrencyTable from './components/CurrencyTable';
import CreateAccForm from './components/CreateAccForm';
import CreateTransactionForm from './components/CreateTransactionForm';
import { axiosWrapper, ajaxGetRecentTransactions, ajaxCreateAcc, ajaxCreateTransaction, ajaxGetAccounts, ajaxGetCurrencies } from "./ajax";
import AccountTree from './components/AccountTree';

/**
 * Makes a '<Link>' for a router.
 * @param {Object} linkData - An object with data for the link.
 * @param {string} linkData.path - The path (url).
 * @param {string} linkData.text - The text to display in the link.
 */
export function makeLink({path, text}) {
  return <li key={path}><Link to={path}>{text}</Link></li>
}

/**
 * Makes a '<Route>' for a router.
 * @param {Object} routeData - An object with data for the route.
 * @param {string} routeData.path - The path (url).
 * @param {Function} linkData.component - a 0-arity function returning a
 *   component to render for this route.
 */
export function makeRoute({path, component}) {
  return (<Route key={path} path={path} component={component} />)
}

/**
 * Makes a Router object given a data.
 * @param {Object[]} routerData - An object with data for the router.
 */
export function makeRouter(routerData) {
  const links = R.map(makeLink, routerData);
  const routes = R.map(makeRoute, routerData);
  return (
    <Router>
      <div>
        <ul>
          {links}
        </ul>
        {routes}
      </div>
    </Router>
  )
}

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
    this.state = {transactions: null};
  }

  setTransactions = (transactions) => {
    this.setState({transactions});
  }

  setAccounts = (accounts) => {
    this.setState({accounts});
  }

  setCurrencies = (currencies) => {
    this.setState({currencies});
  }

  componentDidMount() {
    // Loads transactions and sets state on return
    const { getTransactions = ajaxGetRecentTransactions } = this.props;
    const getTransactionsPromise = getTransactions(axiosWrapper)
          .then(this.setTransactions);

    // Same for accounts
    const { getAccounts = ajaxGetAccounts } = this.props;
    const getAccountsPromise = getAccounts(axiosWrapper)
          .then(this.setAccounts);

    // Same for currencies
    const { getCurrencies = ajaxGetCurrencies } = this.props;
    const getCurrenciesPromise = getCurrencies(axiosWrapper)
          .then(this.setCurrencies);

    this.busy = Promise.all([
      getTransactionsPromise,
      getAccountsPromise,
      getCurrenciesPromise
    ]);
  }

  render() {
    const {
      createAcc = ajaxCreateAcc(axiosWrapper),
      createTransaction = ajaxCreateTransaction(axiosWrapper),
    } = this.props || {};
    const { transactions, accounts, currencies } = this.state;
    const transactionTable = App.renderTransactionTable(transactions);
    const createAccForm = App.renderCreateAccForm(
      accounts,
      createAcc
    );
    const createTransactionForm = App.renderCreateTransactionForm(
      accounts,
      currencies,
      createTransaction
    );
    const accountTree = App.renderAccountTree(accounts);
    const currencyTable = App.renderCurrencyTable(currencies);
    const router = makeRouter(this.getRoutesData({
      transactionTable,
      createAccForm,
      createTransactionForm,
      accountTree,
      currencyTable
    }));

    return (
      <div className="App">
        {router}
      </div>
    );
  }

  /**
   * Returns the data for the routes of the App.
   */
  getRoutesData({
    transactionTable,
    createAccForm,
    createTransactionForm,
    accountTree,
    currencyTable
  }) {
    return [
      {
        path: "/create-transaction/",
        text: "Create Transaction",
        component: () => createTransactionForm,
      },
      {
        path: "/transaction-table/",
        text: "Transaction Table",
        component: () => transactionTable
      },
      {
        path: "/create-account/",
        text: "Create Account",
        component: () => createAccForm
      },
      {
        path: "/account-tree/",
        text: "Account Tree",
        component: () => accountTree
      },
      {
        path: "/currency-table/",
        text: "Currency Table",
        component: () => currencyTable
      },
    ]
  }

  static renderTransactionTable(transactions) {
    // Renders the transactionTable or a loading <p> if transactions is null
    if (transactions !== null) {
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
   * @param {Account[]} accounts - An array of Accounts from where the user can
   *   choose, or null if not yet loaded.
   * @param {Function} createAcc - A function that receives account creation
   *   data and performs the post request to create the account.
   */
  static renderCreateAccForm(accounts, createAcc) {
    // We parametrize createAcc with the AxiosWrapper.
    if (accounts !== [] && !accounts) {
      return <p>Loading...</p>
    }    
    return (
      <CreateAccForm
        title="Create Account"
        createAcc={createAcc}
        accounts={accounts} />
    );
  }

  /**
   * Renders the CreateTransactionForm for the app.
   * @param {Account[]} accounts - An array of accounts from where the user
   *    can choose.
   * @param {Currency[]} currencies - An Array of currencies from where the
   *    user can choose.
   * @param {Function} createTransaction - A curried function that maps an
   *    Axios-like and transactionRawParameters and performs creation of
   *    the transaction.
   */
  static renderCreateTransactionForm(accounts, currencies, createTransaction) {
    if ((accounts !== [] && !accounts) || (currencies !== [] && !currencies)) {
      return <p>Loading...</p>
    }
    return (
      <CreateTransactionForm
        title="Create Transaction"
        createTransaction={createTransaction}
        accounts={accounts}
        currencies={currencies} />
    )
  }

  static renderAccountTree(accounts) {
    if (accounts === null || accounts === undefined) {
      return <p>Loading...</p>
    } else {
      return <AccountTree accounts={accounts} /> 
    }
  }

  static renderCurrencyTable(currencies) {
    if (currencies !== [] && !currencies) {
      return <p>Loading...</p>
    }
    return <CurrencyTable currencies={currencies} title="Currencies" />
  }
}

export default App;
