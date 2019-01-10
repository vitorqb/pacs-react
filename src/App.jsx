import * as R from 'ramda'
import React, { Component } from 'react';
import { BrowserRouter as Router, Link, Route } from 'react-router-dom';
import './App.css';
import TransactionTable from "./components/TransactionTable";
import CurrencyTable from './components/CurrencyTable';
import CreateAccountComponent from './components/CreateAccountComponent.jsx';
import EditAccountComponent from './components/EditAccountComponent.jsx';
import CreateTransactionComponent from './components/CreateTransactionComponent';
import EditTransactionComponent from './components/EditTransactionComponent';
import JournalComponent from './components/JournalComponent.jsx';
import { defaultColumnMakers } from './components/JournalTable.jsx';
import { axiosWrapper, ajaxGetRecentTransactions, ajaxCreateAcc, ajaxCreateTransaction, ajaxGetAccounts, ajaxGetCurrencies, ajaxUpdateTransaction, ajaxGetTransaction, ajaxUpdateAccount, ajaxGetJournalForAccount } from "./ajax";
import AccountTree from './components/AccountTree';
import { newGetter, isDescendant } from './utils';

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

    // Prepares ajax related functions
    const {
      createAcc = ajaxCreateAcc(axiosWrapper),
      updateAcc = ajaxUpdateAccount(axiosWrapper),
      createTransaction = ajaxCreateTransaction(axiosWrapper),
      updateTransaction = ajaxUpdateTransaction(axiosWrapper),
      getTransaction = ajaxGetTransaction(axiosWrapper),
      getJournalForAccount = ajaxGetJournalForAccount(axiosWrapper),
    } = this.props || {};

    // Retrieves from the state
    const { transactions, accounts, currencies } = this.state;

    // Render the components
    const transactionTable = App.renderTransactionTable(
      transactions,
      currencies,
      accounts
    );
    const createAccForm = App.renderCreateAccountComponent(accounts, createAcc);
    const editAccountComponent = App.renderEditAccountComponent(
      accounts,
      updateAcc
    );
    const createTransactionForm = App.renderCreateTransactionComponent(
      accounts,
      currencies,
      createTransaction
    );
    const editTransactionComponent = App.renderEditTransactionComponent(
      getTransaction,
      updateTransaction,
      accounts,
      currencies
    );
    const accountTree = App.renderAccountTree(accounts);
    const currencyTable = App.renderCurrencyTable(currencies);
    const journalComponent = App.renderJournalComponent(
      currencies,
      accounts,
      getJournalForAccount,
    );

    // Prepares the router
    const router = makeRouter(this.getRoutesData({
      transactionTable,
      createAccForm,
      editAccountComponent,
      createTransactionForm,
      accountTree,
      currencyTable,
      editTransactionComponent,
      journalComponent,
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
    editAccountComponent,
    createTransactionForm,
    accountTree,
    currencyTable,
    editTransactionComponent,
    journalComponent
  }) {
    return [
      {
        path: "/create-transaction/",
        text: "Create Transaction",
        component: () => createTransactionForm,
      },
      {
        path: "/edit-transaction/",
        text: "Edit Transaction",
        component: () => editTransactionComponent,
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
        path: "/edit-account/",
        text: "Edit Account",
        component: () => editAccountComponent
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
      {
        path: "/account-journal/",
        text: "Account Journal",
        component: () => journalComponent
      }
    ]
  }

  /**
   * Renders a TransactionTable for the App.
   * @param {Transaction[]} transactions - An array of transaction.
   * @param {Currency[]} currencies - An array of currencies.
   * @param {Account[]} accounts - An array of accounts.
   */
  static renderTransactionTable(transactions, currencies, accounts) {
    // Renders the transactionTable or a loading <p> if transactions is null
    if ((transactions != null) && (currencies != null) && (accounts != null)) {
      const getCurrency = newGetter(R.prop("pk"), currencies);
      const getAccount = newGetter(R.prop("pk"), accounts);
      return (
        <div className="TransactionTableDiv">
          <TransactionTable
            title="Recent Transactions"
            transactions={transactions}
            getCurrency={getCurrency}
            getAccount={getAccount} />
        </div>
      )
    } else {
      return <p>Loading...</p>
    }
  }

  /**
   * Renders the CreateAccountComponent for the app.
   * @param {Account[]} accounts - An array of Accounts from where the user can
   *   choose, or null if not yet loaded.
   * @param {Function} createAcc - A function that receives account creation
   *   data and performs the post request to create the account.
   */
  static renderCreateAccountComponent(accounts, createAcc) {
    // We parametrize createAcc with the AxiosWrapper.
    if (accounts !== [] && !accounts) {
      return <p>Loading...</p>
    }    
    return (
      <CreateAccountComponent
        createAcc={createAcc}
        accounts={accounts} />
    );
  }

  static renderEditAccountComponent(accounts, updateAcc) {
    if (accounts !== [] && !accounts) {
      return <p>Loading...</p>
    }    
    return (
      <EditAccountComponent
        editAccount={updateAcc}
        accounts={accounts} />
    )
  }

  /**
   * Renders the CreateTransactionComponent for the app.
   * @param {Account[]} accounts - An array of accounts from where the user
   *    can choose.
   * @param {Currency[]} currencies - An Array of currencies from where the
   *    user can choose.
   * @param {function} createTransaction - A function that maps an
   *    TransactionSpec and performs creation of the transaction.
   */
  static renderCreateTransactionComponent(accounts, currencies, createTransaction) {
    if ((accounts !== [] && !accounts) || (currencies !== [] && !currencies)) {
      return <p>Loading...</p>
    }
    return (
      <CreateTransactionComponent
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

  static renderEditTransactionComponent(
    getTransaction,
    updateTransaction,
    accounts,
    currencies
  ) {
    if (accounts == null || currencies == null) {
      return <p>Loading...</p>
    }
    return (
      <EditTransactionComponent
        getTransaction={getTransaction}
        updateTransaction={updateTransaction}
        accounts={accounts}
        currencies={currencies} />
    )
  }

  static renderJournalComponent(
    currencies,
    accounts,
    getJournalForAccount
  ) {
    if (accounts == null || currencies == null) {
      return <p>Loading...</p>
    }
    return (
      <JournalComponent
        getAccount={newGetter(R.prop('pk'), accounts)}
        isDescendant={isDescendant(accounts)}
        getCurrency={newGetter(R.prop('pk'), currencies)}
        columnMakers={defaultColumnMakers}
        getJournalForAccount={getJournalForAccount} />
    )
  }
}

export default App;
